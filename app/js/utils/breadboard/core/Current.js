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
    static get ColorMin() {return "#006eff"}
    static get ColorMax() {return "#ff0006"}
    static get DurationMin() {return 1000}    // Чем больше, тем медленнее ток с минимальным весом (600)
    static get DurationMax() {return 10000}   // Чем меньше, тем быстрее ток с максимальным весом (10000)
    static get AnimationDelta() {return 200}  // Расстояние между соседними частицами, px

    constructor(container, points, style) {
        this.container  = container;        // родительский DOM-узел
        this.style      = style;            // стиль SVG-линии
        this.points     = points;           // координаты виртуальных точек линии тока (начало и конец)

        this._container_anim = this.container.nested();     // родительский DOM-узел анимации
        this._id = Math.floor(Math.random() * (10 ** 6));   // Идентификатор по умолчанию - случайная строка

        // Прочие внутрение параметры
        this._particles     = [];           // частицы тока (для анимации)
        this._weight        = 0;            // сила тока
        this._line          = null;         // SVG-линия тока
        this._line_path   = undefined;    // координаты реальных точек линии тока (начало и конец)
        this._line_length   = undefined;    // длина линии тока

        // Параметры анимации
        this._sheet             = undefined;    // CSS-контейнер
        this._anim_timestamp    = undefined;    // временная метка начала анимации
        this._anim_dur          = undefined;    // текущая длительность прохождения Current.AnimationDelta px
        this._anim_delay        = undefined;    // накопленное запаздывание анимации

        // Прочие параметры анимации
        this._radius_min = this.style.width / 2;        // минимальный радиус частицы
        this._radius_max = this.style.particle_radius;  // максимальный радиус частицы

        this._visible = false;
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
    draw(path, weight=0) {
        this.style.color = Current.pickColorFromRange(weight);

        // big thanks to Pythagoras for this formula
        this._line_path = Current._pathArrayToString(path);
        this._line_length = Current.getPathLength(this._line_path);

        this._line = this.container
            .path(this._line_path)
            .fill('none')
            .stroke(this.style)
            .addClass('current-line');

        this._container_anim.before(this._line);
        this._container_anim.opacity(0);

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

        this._visible = false;
    };

    /**
     * Проверить, совпадает ли контур у тока
     *
     * @param {Object} thread контур
     * @returns {boolean}
     */
    hasSameThread(thread) {
        if (!this.points) return false;

        return  thread.from.x === this.points.from.x &&
                thread.from.y === this.points.from.y &&
                thread.to.x === this.points.to.x &&
                thread.to.y === this.points.to.y;
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
    activate(weight=0) {
        if (!this._visible) throw new Error("Cannot activate invisible current");

        if (!this._sheet) {
            this.deactivate();
        }

        // длительность прохода Current.AnimationDelta px пути
        let dur = Math.ceil(Current.DurationMax + weight * (Current.DurationMin - Current.DurationMax));

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
            this._particles[i] = this._container_anim.circle(this.style.particle_radius * 2).addClass('current-particle');

            // Заливка и центрирование
            this._particles[i].fill(Current.pickColorFromRange(weight));

            // Анимировать частицу
            this._animateParticle(this._particles[i], i, particles_per_line, progress_start, progress_end, dur);
        }

        // Это необходимо для того, чтобы дать браузеру вставить анимацию во все полигоны
        // В противном случае, на малую долю секунды будет заметна частица в положении (0,0)
        // до начала анимации
        setTimeout(() => {
            this._container_anim.opacity(1);
        }, 0);
    };

    /**
     * Остановить анимацию тока
     */
    deactivate() {
        this._particles = [];
        this._container_anim.clear();
        this._initStyleSheet();
    };

    /**
     * Изменить вес тока
     * @param weight
     */
    setWeight(weight=0) {
        weight = weight > 1 ? 1 : weight;

        if (this._weight !== weight) {
            // задать скорость
            this._setParticlesSpeed(weight);
            // определить цвет

            // изменить цвет в стиле контура
            this.style.color = Current.pickColorFromRange(weight);

            // применить стиль к контуру
            this._line.stroke(this.style);

            // изменить цвет у всех частиц
            for (let particle of this._particles) {
                particle.fill(this.style.color);
            }

        }

        this._weight = weight;
    }

    /**
     * Добавить фильтр свечения к току
     */
    _addGlowFilter() {
        this._line.attr('filter', 'url(#glow-current)');
    };

    /**
     * Анимировать частицу.
     *
     * Для анимации используется CSS Keyframes.
     * Этот подход является наиболее оптимальным с точки зрения изменения параметров
     * анимации в режиме реального времени, однако требует больше памяти для манипуляции
     * таблицами стилей.
     *
     * Преполагается, что функция вызывается в цикле по анимированным частицам.
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
        rule_animation += `; transform: translate(-${this.style.particle_radius}px, -${this.style.particle_radius}px)`;

        rule_animation += ';}';

        this._sheet.insertRule(rule_animation);

        particle.node.classList.add(animname);

        // Зафиксировать параметры времени
        this._anim_timestamp = new Date().getTime();
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
        return `
            @keyframes cur-${this._id}-${index}-kfs-radius {
                0% {r: ${this._radius_min}}
                ${perc*0.4}% {r: ${this._radius_max}}
                100% {r: ${this._radius_max}}
                }
        `;
    }

    _generateKeyframeRuleScaleDown(index, perc) {
        return `
            @keyframes cur-${this._id}-${index}-kfs-radius {
                0% {r: ${this._radius_max}}
                ${perc*0.6}% {r: ${this._radius_max}}
                ${perc}% {r: ${this._radius_min}}
                100% {r: ${this._radius_min}}
            }
        `;
    }

    _generateKeyframeRuleScaleUpDown(index, perc) {
        return `
            @keyframes cur-${this._id}-${index}-kfs-radius {
                0% {r: 10}
                ${perc*0.4}% {r: ${this._radius_max}}
                ${perc*0.6}% {r: ${this._radius_max}}
                ${perc}% {r: ${this._radius_min}}
                100% {r: ${this._radius_min}}
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

    _setParticlesSpeed(speed) {
        if (!this._sheet) return;

        let dur = Math.ceil(Current.DurationMax + speed * (Current.DurationMin - Current.DurationMax));

        let dt = new Date().getTime() - this._anim_timestamp;

        let mu = dur / this._anim_dur;

        let p1d = dt % this._anim_dur,
            p2d = dt % dur;

        let p2r = p1d * mu;

        this._anim_delay += (p2d - p2r);

        for (let rule of this._sheet.rules) {
            if (rule.constructor.name === "CSSStyleRule") {
                rule.style.animationDuration = `${dur}ms, ${dur}ms`;
                if (this._anim_delay) {
                    rule.style.animationDelay = `${this._anim_delay}ms`
                }
            }
        }

        this._anim_timestamp += (p2d - p2r);
        this._anim_dur = dur;
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

    static pickColorFromRange(weight) {
        let w1 = weight,
            w2 = 1 - w1;

        let color_min = [
            parseInt(Current.ColorMin.slice(1,3), 16),
            parseInt(Current.ColorMin.slice(3,5), 16),
            parseInt(Current.ColorMin.slice(5,7), 16)
        ];

        let color_max = [
            parseInt(Current.ColorMax.slice(1,3), 16),
            parseInt(Current.ColorMax.slice(3,5), 16),
            parseInt(Current.ColorMax.slice(5,7), 16)
        ];

        let rgb = [
            Math.round(color_max[0] * w2 + color_min[0] * w1),
            Math.round(color_max[1] * w2 + color_min[1] * w1),
            Math.round(color_max[2] * w2 + color_min[2] * w1),
        ];

        let rs = Number(rgb[0]).toString(16),
            gs = Number(rgb[1]).toString(16),
            bs = Number(rgb[2]).toString(16);

        if (rs.length === 1) rs = "0" + rs;
        if (gs.length === 1) gs = "0" + gs;
        if (bs.length === 1) bs = "0" + bs;

        return '#' + rs + gs + bs;
    }
}