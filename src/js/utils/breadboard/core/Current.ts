import SVG from 'svg.js';

import { XYObject } from './types';

type RGBColor = [number, number, number];

/**
 * Current style attributes
 * 
 * @category Breadboard
 */
export type CurrentStyle = {
    linecap: string,
    color: string, 
    width: number,
    particle_radius: number,
    opacity: number,
}

/**
 * Current data object
 * 
 * @category Breadboard
 */
export type Thread = {
    /** The weight of the current */
    weight: number;
    /** Start point of the current */
    from: XYObject;
    /** Finish point of the current */
    to: XYObject;

    /** flag for extra purposes */
    ___touched?: boolean;
}

export type CurrentPath = [string, number, number?][];

/**
 * Displays current segment and manages its graphical components and animations. 
 * Single current segment is a line defined by two {@link Cell}s of a breadboard grid with 
 * custom properties.
 *
 * Each {@link Current} has its own container to display the animation. The main element is
 * the _line_ along which little particles move to show the weight and direction of the current.
 *
 * (!) Before launching the animation, it's required to call {@link draw}, which is needed to set
 * the animation path.
 *
 * @param container container for the {@link Current} elements and animations
 * @param style     SVG style for the lines
 * @param speed     speed of partical animations
 * 
 * @category Breadboard
 */
export default class Current {
    /** Root container of the {@link Current} */
    public readonly container: SVG.Container;
    
    /** General properties of the {@link Current} */
    public readonly thread: Thread;

    /** Animation-specific container of the {@link Current} */
    private container_anim: SVG.Nested;
    /** Debug container of the {@link Current} */
    private _group_debug: any;
    /** Current identifier */
    private _id: number;
    /** Schematic style flag */
    private _schematic: boolean;
    /** Current particle SVG elements */
    private _particles: any[];
    /** Current SVG line */
    private _line: SVG.Path;
    /** Geometric SVG-formatted path string of the current line */
    private _line_path: string;
    /** Calculated length of the {@link _line_path} */
    private _line_length: any;
    /** Current animation stylesheet */
    private _sheet: any;
    /** Current animation duration */
    private _anim_dur: any;
    /** Current animation delay */
    private _anim_delay: any;
    /** Current weight */
    private _weight: number;
    /** Current style */
    private _style: { linecap: string; color: string; width: number; particle_radius: number; opacity: any; };
    /** Current visibility flag */
    private _visible: boolean;
    /** Current activation flag */
    private _activated: boolean;
    /** Current burning flag */
    private _burning: boolean;

    /** flags for extra purposes */
    public ___touched: boolean;
    public ___hovered: boolean;

    /**
     * Color gradations of the {@link Current} weight
     * 
     * An arbitrary number of the colors is allowed.
     * Current instance will pick the color from the gradient of the evenly distributed points of colors listed here
     * based on the normailzed value of the weight (0..1). 
     * In this way, currents with weight `0` will have a color `{@link Colors}[0]`, 
     * and currents with weight `1` will be colored with `{@link Colors}[Colors.length - 1]`.
     * 
     * Each color is a string with a six-digit hexadecimal number preceded by hash symbol (`#`).
     */
    static Colors: string[] = [
        "#006eff",
        "#ff0006"
        // "#cd1800",
        // "#f65200",
        // "#ff8602",
        // "#ced601",
        // "#01c231",
        // "#00c282",
        // "#00b5c2",
        // "#006ec2",
    ]

    /** Length of the animation loop for currents with minimum {@link weight} */
    static DurationMin: number = 200;
    /** Length of the animation loop for currents with maximum {@link weight} */
    static DurationMax: number = 10000;
    /** Distance between adjacent particles (px) */
    static AnimationDelta: number = 200;

    /** Line width for currents with maximum weight (px) */
    static WidthMax = 14; 
    /** Line width for currents with maximum weight (px) - schematic mode */
    static WidthSchematicMax = 10;

    /** Particle radius for currents with maximum weight (px) */
    static RadiusMax = 18;
    /** Particle radius for currents with maximum weight (px) - schematic mode */
    static RadiusSchematicMax = 16;
    private _rule_idx_burn_kfs: any;
    private _rule_idx_burn: any;

    /** Weight point when the current begins to lose its opacity (the weight is lower - the current is less opaque) */
    static get FullOpacityThreshold() {return 0.07} 

    constructor(container: SVG.Container, thread: Thread, schematic: boolean) {
        this.thread = thread;
        this.container = container.nested();
        this.container_anim = this.container.nested();     // animation root 

        this._group_debug = undefined; //this.container.group();      // debug root

        this._id = Math.floor(Math.random() * (10 ** 6));   // Default identifier is a random six-digit number

        // Misc internal parameters
        this._schematic     = schematic;
        this._particles     = [];
        this._line          = null;
        this._line_path     = undefined;
        this._line_length   = undefined;

        // Animation parameters
        this._sheet             = undefined;
        this._anim_dur          = undefined; 
        this._anim_delay        = undefined; 

        // Misc animation parameters
        this._weight    = this._normalizeWeight(thread.weight);
        this._style     = this._getStyle(this._weight);

        this._visible   = false;
        this._activated = false;
        this._burning   = false;
    }

    /**
     * Identifier of the {@link Current}
     */
    get id(): number {
        return this._id;
    }

    get weight(): number {
        return this._weight;
    }

    /**
     * Whether the current is short-circuited
     */
    get is_burning(): boolean {
        return this.thread.weight > 2;
    }

    /**
     * Renders current line by given path
     *
     * The glow filter can be applied.
     *
     * @param path original SVG path (geometric coordinates)
     */
    draw(path: CurrentPath): void {
        this._line_path = Current._pathArrayToString(path);
        this._line_length = Current.getPathLength(this._line_path);

        this._line = this.container.path(this._line_path);

        this._line
            .fill('none')
            .stroke(this._style);

        this.container_anim.before(this._line);
        this.container_anim.opacity(0);

        if (this._group_debug) {
            this._group_debug.move(
                this._line.x() + Current.WidthMax,
                this._line.y() + Current.WidthMax
            );
        }

        this._addGlowFilter();

        this._visible = true;
    };

    /**
     * Erases the current
     */
    erase(): void {
        if (!this._line) {
            console.warn("An attempt to erase NULL line was made");
            return;
        }

        this._particles = [];

        this._line.remove();
        this.container_anim.remove();

        this._sheet.ownerNode.remove();

        if (this._group_debug) {
            this._group_debug.remove();
        }

        this._visible = false;
        this._activated = false;
    };

    /**
     * Checks whether the given thread is identical with the {@link Current}'s one
     *
     * @param {Object} thread thread to compare
     */
    hasSameThread(thread: Thread): boolean {
        if (!this.thread) return false;

        return  thread.from.x === this.thread.from.x &&
                thread.from.y === this.thread.from.y &&
                thread.to.x === this.thread.to.x &&
                thread.to.y === this.thread.to.y;
    }

    /**
     * Animates the current within the {@link _line} path
     *
     * A certain number of particles are generated. Particle is a vector object representing the
     * current motion along its path. Along with the color, it helps to visually "feel" the current weight.
     * 
     * Each particle cycles through the path fragment of length `delta` at a certain `speed` 
     * in a way that the motion path of the next particle begins at the end of the previous 
     * particle motion path.
     * 
     * It's important to reduce lags as much as possible in order to update animation properties, 
     * so instead of re-drawing particles, which causes lags due to CPU-intensive DOM component mount operations, 
     * this method alters animation properties through CSS manipulations.
     * To make speed changes seamless, particle animation delay is calculated from the very beginning 
     * of the first {@link Current} appearance as if the new speed was always the same. 
     * See {@link _setParticleSpeed} to get more details.
     * 
     * @see _animateParticle
     * @see _setParticleSpeed
     *
     * @param weight current particle motion speed
     */
    activate(): void {
        if (!this._visible) throw new Error("Cannot activate invisible current");
        if (this._activated) return;

        if (!this._sheet) {
            this.deactivate();
        }

        // длительность прохода Current.AnimationDelta px пути
        let dur = Math.ceil(Current.DurationMax + this._weight * (Current.DurationMin - Current.DurationMax));

        // Число частиц на ток
        let particles_per_line = (this._line_length / Current.AnimationDelta);

        // Для каждой частицы:
        for (let i = 0; i < particles_per_line; i++)
        {
            // Вычислить начальную и конечную позиции движения по контуру (в процентах от всей длины контура)
            let progress_start  = (  i  ) * Current.AnimationDelta / this._line_length;
            let progress_end    = (i + 1) * Current.AnimationDelta / this._line_length;

            // Если частица - последняя, то progress_end будет больше 1
            // Необходимо скорректировать конечную позицию для последней частицы,
            // так как длина всего пути может быть не кратной количеству частиц
            if (progress_end > 1) {
                progress_end = 1;
            }

            // Сгенерировать частицу
            this._particles[i] = this.container_anim.circle(this._style.particle_radius * 2);

            // Заливка и центрирование
            this._particles[i].fill({
                color: Current.pickColorFromRange(this._weight),
                opacity: Current.pickOpacityFromRange(this._weight),
            });

            // Анимировать частицу
            this._animateParticle(this._particles[i], i, particles_per_line, progress_start, progress_end, dur);
        }

        this._updateDebugInfo();

        // Это необходимо для того, чтобы дать браузеру вставить анимацию во все полигоны
        // В противном случае, на малую долю секунды будет заметна частица в положении (0,0)
        // до начала анимации
        setTimeout(() => {
            // функция _updateBurning включает/выключает видимость контейнера с частицами
            this._updateBurning();

            // функция _updateBurning делает это не всегда, поэтому нужно в случае необходимости отображения частиц
            // дополнительно убедится в их видимости
            if (!this.is_burning) {
                this.container_anim.opacity(1);
            }

            this._activated = true;
        }, 0);
    };

    /**
     * Stops the {@link Current} animation
     */
    deactivate(): void {
        this._particles = [];
        this.container_anim.clear();
        this._initStyleSheet();
        this._activated = false;
    };

    /**
     * Shows hidden particles
     * 
     * @see hideParticles
     */
    showParticles(): void {
        this.container_anim.opacity(1);
    }

    /**
     * Hides visible particles
     * 
     * @see showParticles
     */
    hideParticles(): void {
        this.container_anim.opacity(0);
    }

    /**
     * Alters the {@link Current} weight
     * 
     * @param weight
     */
    setWeight(weight: number = 0) {
        const _weight = this._normalizeWeight(weight);

        if (this.thread.weight !== weight) {
            // задать скорость
            this._setParticleSpeed(_weight);

            // изменить цвет в стиле контура
            this._style = this._getStyle(_weight);

            // применить стиль к контуру
            this._line.stroke(this._style);

            // изменить цвет у всех частиц
            for (let particle of this._particles) {
                particle.fill({color: this._style.color, opacity: this._style.opacity});
            }
        }

        this._weight = _weight;
        this.thread.weight = weight;

        this._updateBurning();
        this._updateDebugInfo();
    }

    /**
     * Enables or disables short circuit effect
     * 
     * This function should not be called manually because the animation loop
     * is sensitive to specific effects such as this.
     * 
     * Each time the weight is changed, {@link setWeight} calls this function to
     * ensure proper state of the animation to display short circuit effect.
     */
    private _updateBurning() {
        if (this.is_burning) {
            // "Сжигать" ток от КЗ
            this._burnEnable();
        } else {
            // Отключить "сжигание", возможно, включённое ранее
            this._burnDisable();
        }
    }

    /**
     * Converts the weight to normalized value, 
     * which can be applied to assess the 'power' of the current
     * 
     * An easing is applied because it's difficult to use such visual properties
     * as color and particle speed to illustrate the weight, 
     * The more is the speed, the harder to recognise the differences (as well as when the speed is too low).
     * Linear mapping is not suitable to highlight the weight change.
     * 
     * It's also needed to have a finite limit of the mapping so the `1` value is reachable. 
     * Moreover, values more than `1` is allowed but this will be treated as a _short circuit_ state.
     */
    private _normalizeWeight(weight: string|number): number {
        weight = Number(weight);

        // Keep value in [0..1] interval
        const k = 1.6;
        weight = 1 - 1 / (1 + k * weight);

        return EasingFunctions.easeOutQuad(weight);
    }

    /**
     * Apply glow effect to the current line
     * 
     * @deprecated
     */
    private _addGlowFilter(): void {
        // this._line.attr('filter', 'url(#glow-current)');
    };

    /**
     * Enable short circuit effect
     * 
     * @see setWeight
     * @see _updateBurning
     * @see _burnDisable
     */
    private _burnEnable(): void {
        if (this._burning) return;
        this._burning = true;

        if (!this._line_path) {throw new Error("Cannot animate current which hasn't been drawn")}

        this.hideParticles();

        let animname = `cur-${this._id}-burn`;

        this._rule_idx_burn_kfs =
            this._sheet.insertRule(this._generateKeyframeRuleBurn(this._id, 1000));

        this._rule_idx_burn =
            this._sheet.insertRule(`.${animname} {
            stroke-dasharray: 100;
            
            animation: dash-${this._id} 600ms linear reverse infinite;
        }`);

        this._line.node.classList.add(animname);
    }

    /**
     * Disable short circuit effect
     * 
     * @see setWeight
     * @see _updateBurning
     * @see _burnEnable
     */
    private _burnDisable(): void {
        if (!this._burning) return;
        this._burning = false;

        this._sheet.deleteRule(this._rule_idx_burn_kfs);
        this._sheet.deleteRule(this._rule_idx_burn);

        this._line.node.classList.remove(`cur-${this._id}-burn`);

        this.showParticles();
    }

    /**
     * Animate individual particle
     *
     * For animation, CSS Keyframes is used.
     * This approach is most optimal for real-time animation parameter updates, 
     * but it requires more memory to keep the CSS and more code to manipulate it.
     *
     * It's supposed to call this function in the loop over the particles.
     *
     * @param particle          particle's SVG element
     * @param index             particle index in the current
     * @param particles_count   number of the particles in the current
     * @param progress_start    the percentage of the path to begin the motion
     * @param progress_end      the percentage of the path to end the motion
     * @param dur               time for a particle to move {@link AnimationDelta} px
     */
    private _animateParticle(
        particle: SVG.Circle,
        index: number,
        particles_count: number,
        progress_start: number,
        progress_end: number,
        dur: number = 1000
    ) {
        if (!this._line_path) {throw new Error("Cannot animate current which hasn't been drawn")}

        // actual difference between progress point
        let progress_diff_actual = progress_end - progress_start;

        // normalized progress point difference, it's usually equal to `progress_diff_actual` 
        // except for the last particle, which has a slightly shorter (incomplete) path.
        let progress_diff_normal = 1 / particles_count;

        // Rule prefix within the CSS animation class 
        let animname = `cur-${this._id}-${index}-anim`;

        // Animation finish percent (use ceil if floating point value will cause troubles)
        let perc = (progress_diff_actual / progress_diff_normal * 100);

        let rule_animation              = undefined,    // CSS animation class
            rule_keyframes_move         = undefined,    // CSS keyframes for the motion
            rule_keyframes_blink        = undefined,    // CSS keyframes for the opacity
            rule_keyframes_radius       = undefined;    // CSS keyframes for the radius

        /// Define the keyframes

        // for motion
        rule_keyframes_move = this._generateKeyframeRuleMove(index, progress_start*100, progress_end*100, perc);

        // for opacity - for particles passing an incomplete path (i.e. the last one)
        if (perc < 100) {
            rule_keyframes_blink = this._generateKeyframeRuleBlink(index, perc);
        }

        // for scaling
        if (progress_start === 0 && progress_end === 1) {
            // scaling down - for the first and the last particles simultaneously
            rule_keyframes_radius = this._generateKeyframeRuleScaleUpDown(index, perc);
        } else if (progress_start === 0) {
            // scaling up - for the first particle only
            rule_keyframes_radius = this._generateKeyframeRuleScaleUp(index, perc);
        } else if (progress_end === 1) {
            // scaling down - for the last particle only
            rule_keyframes_radius = this._generateKeyframeRuleScaleDown(index, perc);
        }

        /// Construct animation class properties

        // motion
        rule_animation = `.${animname} {animation:  ${this._generateAnimationRuleMove(index, dur)}`;
        this._sheet.insertRule(rule_keyframes_move);

        // opacity
        if (rule_keyframes_blink) {
           rule_animation += `, ${this._generateAnimationRuleBlink(index, dur)}`;
           this._sheet.insertRule(rule_keyframes_blink);
        }

        // radius
        if (rule_keyframes_radius) {
            rule_animation += `, ${this._generateAnimationRuleScale(index, dur)}`;
            this._sheet.insertRule(rule_keyframes_radius);
        }

        rule_animation += `; offset-path: path('${this._line_path}')`;
        rule_animation += `; transform: translate(-${this._style.particle_radius}px, -${this._style.particle_radius}px)`;

        rule_animation += ';}';

        this._sheet.insertRule(rule_animation);

        particle.node.classList.add(animname);

        /// Apply time-related properties
        this._anim_dur = dur;
        this._anim_delay = 0;
    }

    private _generateKeyframeRuleBurn(id: number, to: number) {
        return `
            @keyframes dash-${this._id} {
                to {
                    stroke-dashoffset: ${to}; 
                }
            }
        `;
    }

    private _generateKeyframeRuleMove(index: number, from: number, to: number, perc: number) {
        return `
            @keyframes cur-${this._id}-${index}-kfs-move {
                0% {offset-distance: ${from}%}
                ${perc}% {offset-distance: ${to}%}
                100% {offset-distance: ${to}%}
            } 
        `;
    }

    private _generateKeyframeRuleBlink(index: number, perc: number) {
        return `
            @keyframes cur-${this._id}-${index}-kfs-blink {
                0% {opacity: 1}
                ${perc}% {opacity: 1}
                100% {opacity: 0}
            }
        `;
    }

    private _generateKeyframeRuleScaleUp(index: number, perc: number) {
        const scale_min = this._style.width / 2,
              scale_max = this._style.particle_radius;

        return `
            @keyframes cur-${this._id}-${index}-kfs-radius {
                0% {r: ${scale_min}}
                ${perc*0.4}% {r: ${scale_max}}
                100% {r: ${scale_max}}
                }
        `;
    }

    private _generateKeyframeRuleScaleDown(index: number, perc: number) {
        const scale_min = this._style.width / 2,
              scale_max = this._style.particle_radius;

        return `
            @keyframes cur-${this._id}-${index}-kfs-radius {
                0% {r: ${scale_max}}
                ${perc*0.6}% {r: ${scale_max}}
                ${perc}% {r: ${scale_min}}
                100% {r: ${scale_min}}
            }
        `;
    }

    private _generateKeyframeRuleScaleUpDown(index: number, perc: number) {
        const scale_min = this._style.width / 2,
              scale_max = this._style.particle_radius;

        return `
            @keyframes cur-${this._id}-${index}-kfs-radius {
                0% {r: 10}
                ${perc*0.4}% {r: ${scale_max}}
                ${perc*0.6}% {r: ${scale_max}}
                ${perc}% {r: ${scale_min}}
                100% {r: ${scale_min}}
            }
        `;
    }

    private _generateAnimationRuleSmoke(duration: number, nonlinearity: number = 0) {
        if (nonlinearity < 0) throw RangeError("animation nonlinearity shouldn't be less than 0");
        if (nonlinearity > 1) throw RangeError("animation nonlinearity shouldn't be more than 1");

        let secnum = 50 * nonlinearity,
            firstnum = 100 - secnum;

        return `smokemove ${duration}ms cubic-bezier(${firstnum/100},${secnum/100},1,1) reverse;`
    }

    private _generateAnimationRuleMove(index: number, duration: number) {
        return `cur-${this._id}-${index}-kfs-move ${duration}ms linear infinite`;
    }

    private _generateAnimationRuleBlink(index: number, duration: number) {
        return `cur-${this._id}-${index}-kfs-blink ${duration}ms step-start infinite`;
    }

    private _generateAnimationRuleScale(index: number, duration: number) {
        return `cur-${this._id}-${index}-kfs-radius ${duration}ms linear infinite`;
    }

    private _setParticleSpeed(speed: number) {
        if (!this._sheet) return;

        let delay;

        // новая длительность цикла анимации (ДЦА), мс
        let dur = Current.DurationMax + speed * (Current.DurationMin - Current.DurationMax);

        // время, прошедшее с начала запуска анимации
        // let dt = new Date().getTime() - this._anim_timestamp;
        let dt = (this.container_anim.node as unknown as SVGSVGElement).getCurrentTime() * 1000;

        // сколько прошло времени для того, чтобы частица попала в текущее положение
        let togo_now = (dt - this._anim_delay) % this._anim_dur; // при текщущей ДЦА, учитывая предыдущую задержку
        let togo_willbe = dt % dur; // при новой ДЦА

        // процент положения частицы на пути
        let pct_now = togo_now / this._anim_dur; // при текущей ДЦА
        let pct_willbe = togo_willbe / dur; // при новой ДЦА

        // разница в положении частицы при разных ДЦА:
        // положительная, если происходит ускорение
        // отрицательная, если происходит замедление
        let pct_diff = pct_willbe - pct_now;

        // отрицательная задержка - анимация будет "перематываться" вперёд
        // при новой ДЦА на ту же точку, на которой она была при старой ДЦА
        delay = -(dur - (pct_diff * dur));

        for (let rule of this._getSheetRules()) {
            if (rule.constructor.name === "CSSStyleRule") {
                rule.style.animationDuration = `${dur}ms, ${dur}ms`;
                rule.style.animationDelay = `${delay}ms`;
            }
        }
        this._anim_dur = dur;
        this._anim_delay = delay;
    }

    private _getSheetRules() {
        // firefox compat
        return this._sheet.rules ? this._sheet.rules : this._sheet.cssRules;
    }

    private _initStyleSheet() {
        if (this._sheet) {
            this._sheet.ownerNode.remove();
        }

        let style = document.createElement('style');
        style.id = String(this._id);
        document.body.appendChild(style);

        this._sheet = style.sheet;

        this._initStaticAnimationRules();
    }

    private _initStaticAnimationRules() {
        this._sheet.insertRule(`@keyframes smokemove {
            0% {
                opacity: 0;
            }
            10% {
                 opacity: 0;
            }
            100% {
                opacity: 1; 
                offset-distance: 100%;
            }
        }`);
    }

    static getPathLength(path: string) {
        let path_node = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path_node.innerHTML = path;
        path_node.setAttributeNS(null, "d", path);

        return path_node.getTotalLength();
    }

    static _pathArrayToString(path_arr: CurrentPath): string {
        let str = "";

        for (let path_item of path_arr) {
            switch (path_item.length) {
                case 3: {str += `${path_item[0]} ${path_item[1]},${path_item[2]} `; break;}
                default: throw new Error("Invalid path array");
            }
        }

        return str;
    }

    _getStyle(weight: number): CurrentStyle {
        const width_max = this._schematic ? Current.WidthSchematicMax : Current.WidthMax,
              radii_max = this._schematic ? Current.RadiusSchematicMax : Current.RadiusMax;

        // const alpha = weight / 0.1;
        const alpha = 1;

        const width = weight > 0.1 ? width_max : Math.floor( alpha * width_max),
              radii = weight > 0.1 ? radii_max : Math.floor(alpha * radii_max);

        let style = {
            linecap: "round",
            color: Current.pickColorFromRange(weight),
            width: width,
            particle_radius: radii,
            opacity: Current.pickOpacityFromRange(weight),
        };

        return style;
    }

    _updateDebugInfo(): void {
        const wght_anim = Number.parseFloat(String(this._weight)).toPrecision(4);
        const wght_thrd = Number.parseFloat(String(this.thread.weight)).toPrecision(4);

        if (this._group_debug) {
            this._group_debug.clear();
            this._group_debug.text(`aw:  ${wght_anim}\ntw:  ${wght_thrd}`)
                             .font({'line-height': '1em', weight: 'bold'})
                             .style({color: 'blue'})
        }
    }

    static pickOpacityFromRange(weight: number): number {
        weight = weight > 1 ? 1 : weight < 0 ? 0 : weight;

        const max = Current.FullOpacityThreshold;

        weight = weight > max ? 1 : 1 - Math.exp(-10 * weight / max);

        return weight;
    }

    static pickColorFromRange(weight: number): string {
        // вес должен быть в пределах [0..1]
        weight = weight > 1 ? 1 : weight < 0 ? 0 : weight;

        // размер секции перехода цветов (secsize <= 1)
        let secsize = 1 / (Current.Colors.length - 1);

        // номер секции перехода цветов (section <= кол-во цветов)
        let section = Math.ceil(weight / secsize);
        section = section > 0 ? section -1 : 0;

        // вес в рамках секции (0 <= subweight <= 1)
        let subweight = weight - secsize * section;

        let color_min = undefined,
            color_max = undefined;

        switch (Current.Colors.length) {
            case 0: {
                color_min = color_max = "#000000";
                break;
            }
            case 1: {
                color_min = color_max = Current.Colors[0];
                break;
            }
            default: {
                if (section === Current.Colors.length - 1) {
                    color_min = Current.Colors[section-1];
                    color_max = Current.Colors[section];
                } else {
                    color_min = Current.Colors[section];
                    color_max = Current.Colors[section+1];
                }
            }
        }

        color_min = this.convertHexToRGB(color_min);
        color_max = this.convertHexToRGB(color_max);

        // FIXME: Color jumping

        let rgb = this.pickHex(color_max, color_min, subweight);

        return this.convertRGBToHex(rgb);
    }

    static convertHexToRGB(hex: string): RGBColor {
        return [
            parseInt(hex.slice(1,3), 16),
            parseInt(hex.slice(3,5), 16),
            parseInt(hex.slice(5,7), 16)
        ];
    }

    static convertRGBToHex(rgb: RGBColor): string {
        let rs = Number(rgb[0]).toString(16),
            gs = Number(rgb[1]).toString(16),
            bs = Number(rgb[2]).toString(16);

        if (rs.length === 1) rs = "0" + rs;
        if (gs.length === 1) gs = "0" + gs;
        if (bs.length === 1) bs = "0" + bs;

        return '#' + rs + gs + bs;
    }

    static pickHex(color1: RGBColor, color2: RGBColor, weight: number): RGBColor {
        let w1 = weight,
            w2 = 1 - w1;

        return [
            Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)
        ];
    }
}

const EasingFunctions = {
  // no easing, no acceleration
  linear: (t: number) => t,
  // accelerating from zero velocity
  easeInQuad: (t: number) => t*t,
  // decelerating to zero velocity
  easeOutQuad: (t: number) => t*(2-t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: (t: number) => t<.5 ? 2*t*t : -1+(4-2*t)*t,
  // accelerating from zero velocity
  easeInCubic: (t: number) => t*t*t,
  // decelerating to zero velocity
  easeOutCubic: (t: number) => (--t)*t*t+1,
  // acceleration until halfway, then deceleration
  easeInOutCubic: (t: number) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
  // accelerating from zero velocity
  easeInQuart: (t: number) => t*t*t*t,
  // decelerating to zero velocity
  easeOutQuart: (t: number) => 1-(--t)*t*t*t,
  // acceleration until halfway, then deceleration
  easeInOutQuart: (t: number) => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
  // accelerating from zero velocity
  easeInQuint: (t: number) => t*t*t*t*t,
  // decelerating to zero velocity
  easeOutQuint: (t: number) => 1+(--t)*t*t*t*t,
  // acceleration until halfway, then deceleration
  easeInOutQuint: (t: number) => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
}