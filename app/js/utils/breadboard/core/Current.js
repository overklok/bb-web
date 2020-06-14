import thm from '../styles/current.css';

/**
 * Класс "Ток"
 *
 * Необходим для отображения на сетке точек одного тока с определёнными свойствами.
 *
 * Каждый ток имеет собственный контейнер для отображения анимации.
 *
 * (!) Прежде чем запускать анимацию, необходимо вызвать draw(), с помощью которого можно задать
 * току контур, по которому будет идти анимация.
 *
 * @param container контейнер, в котором будет производиться отрисовка и анимация тока
 * @param style     SVG-стиль линии, изображающей ток
 * @param speed     Скорость движения анимации тока
 * @constructor
 */
export default class Current {
    static get Colors() {return [
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
    ]}

    static get DurationMin() {return 200}       // Длительность цикла анимации частиц тока при минимальном весе
    static get DurationMax() {return 10000}     // Длительность цикла анимации частиц тока при максимальном весе
    static get AnimationDelta() {return 200}    // Расстояние между соседними частицами, px

    static get WidthMax() {return 14};           // Толщина тока при максимальном весе
    static get WidthSchematicMax() {return 10};  // Толщина тока при максимальном весе (в схематическом режиме)

    static get RadiusMax() {return 18};           // Радиус частиц при максимальном весе
    static get RadiusSchematicMax() {return 16};  // Радиус частиц при максимальном весе (в схематическом режиме)

    static get FullOpacityThreshold() {return 0.07} // Граница веса, при которой ток ещё полностью непрозрачности

    constructor(container, thread, schematic) {
        this.container  = container;        // родительский DOM-узел
        this.thread     = thread;           // координаты виртуальных точек линии тока (начало и конец)

        this._container_anim    = this.container.nested();     // родительский DOM-узел анимации
        // this._group_debug       = this.container.group();      // DOM-узел для отладки
        this._id = Math.floor(Math.random() * (10 ** 6));   // Идентификатор по умолчанию - случайная строка

        // Прочие внутрение параметры
        this._schematic     = schematic;
        this._particles     = [];           // частицы тока (для анимации)
        this._line          = null;         // SVG-линия тока
        this._line_path     = undefined;    // координаты реальных точек линии тока (начало и конец)
        this._line_length   = undefined;    // длина линии тока

        // Параметры анимации
        this._sheet             = undefined;    // CSS-контейнер
        this._anim_dur          = undefined;    // текущая длительность прохождения Current.AnimationDelta px
        this._anim_delay        = undefined;    // накопленное запаздывание анимации

        // Прочие параметры анимации
        this._weight    = this._normalizeWeight(thread.weight);
        this._style     = this._getStyle(this._weight);

        this._visible   = false;
        this._activated = false;
    }

    /**
     * Возратить идентификатор
     *
     * @returns {number | *}
     */
    get id() {
        return this._id;
    }

    /**
     * Отрисовать контур тока по заданному пути
     *
     * Применяется фильтр свечения.
     *
     * @param path
     * @param weight
     */
    draw(path) {
        // big thanks to Pythagoras for this formula
        this._line_path = Current._pathArrayToString(path);
        this._line_length = Current.getPathLength(this._line_path);

        this._line = this.container
            .path(this._line_path)
            .fill('none')
            .stroke(this._style)
            .addClass('current-line');

        this._container_anim.before(this._line);
        this._container_anim.opacity(0);

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
     * Стереть ток
     */
    erase() {
        if (!this._line) {
            console.warn("An attempt to erase NULL line was made");
            return null;
        }

        this._particles = [];

        this._line.remove();
        this._container_anim.remove();

        this._sheet.ownerNode.remove();

        if (this._group_debug) {
            this._group_debug.remove();
        }

        this._visible = false;
        this._activated = false;
    };

    burn() {
        this.deactivate();

        // TODO: Animate line and add smoke particles

        setTimeout(() => {
            this.erase()
        }, 400)
    }

    /**
     * Проверить, совпадает ли контур у тока
     *
     * @param {Object} thread контур
     * @returns {boolean}
     */
    hasSameThread(thread) {
        if (!this.thread) return false;

        return  thread.from.x === this.thread.from.x &&
                thread.from.y === this.thread.from.y &&
                thread.to.x === this.thread.to.x &&
                thread.to.y === this.thread.to.y;
    }

    /**
     * Анимировать ток по контуру this._line
     *
     * Генерируется некоторое число частиц - векторных объектов, изображающих ток по контуру.
     * Каждая частица циклически проходит фрагмент пути длины delta с заданной скоростью speed
     * таким образом, что путь движения каждой последующей частицы берёт начало в том месте,
     * где предыдущая заканчивает итерацию цикла движения.
     *
     * Отключение сброса частиц необходимо в случае, когда требуется изменить свойства анимации,
     * не перерисовывая частицы с нуля.
     *
     * @param weight    Скорость анимации тока (движения частиц по контуру)
     */
    activate() {
        if (!this._visible) throw new Error("Cannot activate invisible current");
        if (this._activated) throw new Error("The current is activated already");

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
            this._particles[i] = this._container_anim.circle(this._style.particle_radius * 2).addClass('current-particle');

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
            this._container_anim.opacity(1);
            this._activated = true;
        }, 0);
    };

    /**
     * Остановить анимацию тока
     */
    deactivate() {
        this._particles = [];
        this._container_anim.clear();
        this._initStyleSheet();
        this._activated = false;
    };

    /**
     * Изменить вес тока
     * @param weight
     */
    setWeight(weight=0) {
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

        this._updateDebugInfo();
    }

    _normalizeWeight(weight) {
        weight = Number(weight);

        // Держать значение в интервале [0..1]
        const k = 1.6;
        weight = 1 - 1 / (1 + k * weight);

        return EasingFunctions.easeOutQuad(weight);
    }

    /**
     * Добавить фильтр свечения к току
     */
    _addGlowFilter() {
        // this._line.attr('filter', 'url(#glow-current)');
    };

    /**
     * Анимировать частицу.
     *
     * Для анимации используется CSS Keyframes.
     * Этот подход является наиболее оптимальным с точки зрения изменения параметров
     * анимации в режиме реального времени, однако требует больше памяти для манипуляции
     * таблицами стилей.
     *
     * Предполагается, что функция вызывается в цикле по частицам.
     *
     * @param particle              {SVG.Circle}    SVG-представление частицы, изображающей ток
     * @param index                 {Number}        Порядковый номер (индекс) сгенерированной частицы
     * @param particles_count       {Number}        Число частиц на ток
     * @param progress_start        {Number}        Доля пути, на которой следует начать движение
     * @param progress_end          {Number}        Доля пути, на которой следует закончить движение
     * @param dur                   {Number}        Время, за которое частица должна пройти Current.AnimationDelta px
     */
    _animateParticle(particle, index, particles_count, progress_start, progress_end, dur=1000) {
        if (!this._line_path) {throw new Error("Cannot animate current which hasn't been drawn")}

        // действительная разница точек прогресса
        let progress_diff_actual = progress_end - progress_start;

        // нормальная разница точек прогресса, обычно равна progress_diff_actual
        // за исключением случая с последней частицей, когда она проходит путь меньший, чем у остальных
        let progress_diff_normal = 1 / particles_count;

        // Префикс правил для класса анимации
        let animname = `cur-${this._id}-${index}-anim`;

        // Процент окончания анимации
        let perc = Math.floor(progress_diff_actual / progress_diff_normal * 100);

        let rule_animation              = undefined,    // CSS-класс анимации
            rule_keyframes_move         = undefined,    // контрольные точки перемещения
            rule_keyframes_blink        = undefined,    // контрольные точки непрозрачности
            rule_keyframes_radius       = undefined;    // контрольные точки радиуса

        /// Задание контрольных точек:

        // движение
        rule_keyframes_move = this._generateKeyframeRuleMove(index, progress_start*100, progress_end*100, perc);

        // исчезновение - для частицы, проходящих неполный путь
        // (как правило, последней)
        if (perc < 100) {
            rule_keyframes_blink = this._generateKeyframeRuleBlink(index, perc);
        }

        // масштабирование
        if (progress_start === 0 && progress_end === 1) {
            // уменьшение - для первой и последней частицы одновременно
            rule_keyframes_radius = this._generateKeyframeRuleScaleUpDown(index, perc);
        } else if (progress_start === 0) {
            // увеличение - для первой частицы
            rule_keyframes_radius = this._generateKeyframeRuleScaleUp(index, perc);
        } else if (progress_end === 1) {
            // уменьшение - для последней частицы
            rule_keyframes_radius = this._generateKeyframeRuleScaleDown(index, perc);
        }

        /// Составление класса анимации

        // движение
        rule_animation = `.${animname} {animation:  ${this._generateAnimationRuleMove(index, dur)}`;
        this._sheet.insertRule(rule_keyframes_move);

        // исчезновение
        if (rule_keyframes_blink) {
           rule_animation += `, ${this._generateAnimationRuleBlink(index, dur)}`;
           this._sheet.insertRule(rule_keyframes_blink);
        }

        // радиус
        if (rule_keyframes_radius) {
            rule_animation += `, ${this._generateAnimationRuleScale(index, dur)}`;
            this._sheet.insertRule(rule_keyframes_radius);
        }

        rule_animation += `; offset-path: path('${this._line_path}')`;
        rule_animation += `; transform: translate(-${this._style.particle_radius}px, -${this._style.particle_radius}px)`;

        rule_animation += ';}';

        this._sheet.insertRule(rule_animation);

        particle.node.classList.add(animname);

        // Зафиксировать параметры времени
        this._anim_dur = dur;
        this._anim_delay = 0;
    }

    _generateKeyframeRuleMove(index, from, to, perc) {
        return `
            @keyframes cur-${this._id}-${index}-kfs-move {
                0% {offset-distance: ${from}%}
                ${perc}% {offset-distance: ${to}%}
                100% {offset-distance: ${to}%}
            } 
        `;
    }

    _generateKeyframeRuleBlink(index, perc) {
        return `
            @keyframes cur-${this._id}-${index}-kfs-blink {
                0% {opacity: 1}
                ${perc}% {opacity: 1}
                100% {opacity: 0}
            }
        `;
    }

    _generateKeyframeRuleScaleUp(index, perc) {
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

    _generateKeyframeRuleScaleDown(index, perc) {
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

    _generateKeyframeRuleScaleUpDown(index, perc) {
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

    _generateAnimationRuleMove(index, duration) {
        return `cur-${this._id}-${index}-kfs-move ${duration}ms linear infinite`;
    }

    _generateAnimationRuleBlink(index, duration) {
        return `cur-${this._id}-${index}-kfs-blink ${duration}ms step-start infinite`;
    }

    _generateAnimationRuleScale(index, duration) {
        return `cur-${this._id}-${index}-kfs-radius ${duration}ms linear infinite`;
    }

    _setParticleSpeed(speed) {
        if (!this._sheet) return;

        let delay = 0;

        // новая длительность цикла анимации (ДЦА), мс
        let dur = Math.ceil(Current.DurationMax + speed * (Current.DurationMin - Current.DurationMax));

        // время, прошедшее с начала запуска анимации
        // let dt = new Date().getTime() - this._anim_timestamp;
        let dt = this._container_anim.node.getCurrentTime() * 1000;

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

    _getSheetRules() {
        // firefox compat
        return this._sheet.rules ? this._sheet.rules : this._sheet.cssRules;
    }

    _initStyleSheet() {
        if (this._sheet) {
            this._sheet.ownerNode.remove();
        }

        let style = document.createElement('style');
        style.id = this._id;
        document.body.appendChild(style);

        this._sheet = style.sheet;
    }

    static getPathLength(path) {
        let path_node = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path_node.innerHTML = path;
        path_node.setAttributeNS(null, "d", path);

        return path_node.getTotalLength();
    }

    static _pathArrayToString(path_arr) {
        let str = "";

        for (let path_item of path_arr) {
            switch (path_item.length) {
                case 3: {str += `${path_item[0]} ${path_item[1]},${path_item[2]} `; break;}
                default: throw new Error("Invalid path array");
            }
        }

        return str;
    }

    _getStyle(weight) {
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

    _updateDebugInfo() {
        const wght_anim = Number.parseFloat(this._weight).toPrecision(4);
        const wght_thrd = Number.parseFloat(this.thread.weight).toPrecision(4);

        if (this._group_debug) {
            this._group_debug.clear();
            this._group_debug.text(`aw:  ${wght_anim}\ntw:  ${wght_thrd}`)
                             .font({'line-height': '1em', weight: 'bold'})
                             .style({color: 'blue'})
        }
    }

    static pickOpacityFromRange(weight) {
        weight = weight > 1 ? 1 : weight < 0 ? 0 : weight;

        const max = Current.FullOpacityThreshold;

        weight = weight > max ? 1 : 1 - Math.exp(-10 * weight / max);

        return weight;
    }

    static pickColorFromRange(weight) {
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

    static convertHexToRGB(hex) {
        return [
            parseInt(hex.slice(1,3), 16),
            parseInt(hex.slice(3,5), 16),
            parseInt(hex.slice(5,7), 16)
        ];
    }

    static convertRGBToHex(rgb) {
        let rs = Number(rgb[0]).toString(16),
            gs = Number(rgb[1]).toString(16),
            bs = Number(rgb[2]).toString(16);

        if (rs.length === 1) rs = "0" + rs;
        if (gs.length === 1) gs = "0" + gs;
        if (bs.length === 1) bs = "0" + bs;

        return '#' + rs + gs + bs;
    }

    static pickHex(color1, color2, weight) {
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
  linear: t => t,
  // accelerating from zero velocity
  easeInQuad: t => t*t,
  // decelerating to zero velocity
  easeOutQuad: t => t*(2-t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
  // accelerating from zero velocity
  easeInCubic: t => t*t*t,
  // decelerating to zero velocity
  easeOutCubic: t => (--t)*t*t+1,
  // acceleration until halfway, then deceleration
  easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
  // accelerating from zero velocity
  easeInQuart: t => t*t*t*t,
  // decelerating to zero velocity
  easeOutQuart: t => 1-(--t)*t*t*t,
  // acceleration until halfway, then deceleration
  easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
  // accelerating from zero velocity
  easeInQuint: t => t*t*t*t*t,
  // decelerating to zero velocity
  easeOutQuint: t => 1+(--t)*t*t*t*t,
  // acceleration until halfway, then deceleration
  easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
}