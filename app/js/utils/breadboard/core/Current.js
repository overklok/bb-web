const GRID_DOT_SIZE = 20;           // Радиус точек

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
    static get ColorMin() {return "#7df9ff"}
    static get ColorMax() {return "#6cff65"}
    static get AnimationDelta() {return 100} // Расстояние между соседними стрелками, px

    constructor(container, points, style) {
        this.container = container;
        this.style = style;
        this.path = null;
        this.arrows = [];
        this.weight = 0;
        this.thread = points;

        /// Идентификатор - по умолчанию случайная строка
        this._id = Math.floor(Math.random() * (10 ** 6));

        this.container_anim = this.container.nested();

        this._visible = false;
    }

    get id() {
        return this._id;
    }

    /**
     * Отрисовать контур тока по заданному пути
     *
     * Применяется фильтр свечения.
     *
     * @param path
     */
    draw(path, weight=0) {
        this.weight = weight > 1 ? 1 : weight;
        this.style.color = Current.pickColorFromRange(this.weight);

        this.path = this.container
            .path(path)
            .addClass('current-path')
            .fill('none')
            .stroke(this.style)
            .data('key', 'value')
            .addClass('current-path');

        this.container_anim.before(this.path);
        this.container_anim.opacity(0);

        this.addGlow();

        this.path.opacity(0).animate('200ms').opacity(1);

        this._visible = true;
    };

    /**
     * Стереть ток
     */
    erase() {
        if (!this.path) {
            console.warn("An attempt to erase NULL path was made");
            return null;
        }

        this.arrows = [];

        this.path.animate('200ms').opacity(0);
        this.container_anim.animate('300ms').opacity(0);

        setTimeout(() => {
            this.path.remove();
            this.container_anim.remove();
        }, 300);

        this._visible = false;
    };

    hasSameThread(thread) {
        return  thread.from.x === this.thread.from.x &&
                thread.from.y === this.thread.from.y &&
                thread.to.x === this.thread.to.x &&
                thread.to.y === this.thread.to.y;
    }

    /**
     * Анимировать ток по контуру this.path
     *
     * @param speed       Скорость анимации тока (движения стрелок по контуру)
     *
     * Генерируется некоторое число стрелок - векторных объектов, изображающих ток по контуру.
     * Каждая стрелка циклически проходит фрагмент пути длины delta с заданной скоростью speed
     * таким образом, что путь движения каждой последующей стрелки берёт начало в том месте,
     * где предыдущая заканчивает итерацию цикла движения.
     *
     */
    activate(speed) {
        if (!this._visible) {
            throw new Error("Cannot activate invisible current!");
        }

        // Рассчитаем длину контура
        let length = this.path.length();

        // Определим число стрелок
        let arrows_count = Math.floor(length) / (Current.AnimationDelta);

        // Для каждой стрелки:
        for (let i = 0; i < arrows_count; i++)
        {
            // Вычислить начальную и конечную позиции движения по контуру (в процентах от всей длины контура)
            let progress_start  = (  i  ) / arrows_count;
            let progress_end    = (i + 1) / arrows_count;

            // Время, за которое стрелка должна пройти этот путь
            let time = speed;

            // Если стрелка - последняя, то progress_end будет больше 1
            // Необходимо скорректировать конечную позицию для последней стрелки,
            // так как длина всего пути может быть не кратной количеству стрелок
            if (progress_end > 1) {
                progress_end = 1;
            }

            // Векторное представление стрелки
            // let arrow = this.container_anim.polygon(
            //     "0,0 0," + GRID_DOT_SIZE/2 +  " " + GRID_DOT_SIZE / 4 + "," + GRID_DOT_SIZE / 4
            // ).center(0,0).addClass('current-arrow');

            let arrow = this.container_anim
                .circle(GRID_DOT_SIZE*1.8)
                .center(0, 0)
                .addClass('current-arrow');

            // Заливка и центрирование
            arrow.fill(Current.pickColorFromRange(this.weight));

            this.arrows.push(arrow);

            Current.animateArrowMove(this.path.toString(), arrow, time, progress_start, progress_end);

            if (i === 0) {
                // если первая стрелка
                Current.animateArrowScale(arrow, time, false);
            }

            if (i === arrows_count - 1) {
                // если последняя стрелка
                Current.animateArrowScale(arrow, time, true);
            }
        }

        // Это необходимо для того, чтобы дать браузеру вставить анимацию во все полигоны
        // В противном случае, на малую долю секунды будет заметна частица в положении (0,0)
        // до начала анимации
        setTimeout(() => {
            this.container_anim.opacity(1);
        }, 0);
    };

    /**
     * Остановить анимацию тока
     */
    deactivate() {
        this.arrows = [];

        this.container_anim.clear();
    };

    /**
     * Добавить фильтр свечения к току
     */
    addGlow() {
        this.path.attr('filter', 'url(#glow-current)');
    };

    setWeight(weight=0) {
        this.weight = weight > 1 ? 1 : weight;

        console.log(this.weight);

        let color = Current.pickColorFromRange(this.weight);

        this.path.stroke({color});

        for (let arw of this.arrows) {
            arw.fill(color);
        }
    }

    static animateArrowMove(path, arrow, time, progress_start, progress_end) {
        // SVG-анимация стрелки:
        let aniMove = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion"); // тип: перемещение
        aniMove.setAttribute("start", "0s");                                              // задержка
        aniMove.setAttribute("dur", time + "ms");                                         // длительность
        aniMove.setAttribute("repeatCount", "indefinite");                                // бесконечная
        aniMove.setAttribute("rotate", "auto");                                           // автоповорот
        aniMove.setAttribute("keyPoints", progress_start + ";" + progress_end);           // нач. и кон. позиции в %
        aniMove.setAttribute("keyTimes", "0;1");                                          // нач. и кон. время в %
        aniMove.setAttribute("calcMode", "linear");                                       // (!) функция перемещения

        // В аниматор нужно вставить путь анимации
        let mpath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
        mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + path.toString());

        // Подключение в DOM
        aniMove.appendChild(mpath);
        arrow.node.appendChild(aniMove);
    };

    static animateArrowScale(arrow, time, out = false) {
        // SVG-анимация стрелки:
        let aniTrans = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform"); // тип: трансформ.
        aniTrans.setAttribute("attributeName", "transform");                               // радиус
        aniTrans.setAttribute("type", "scale");
        aniTrans.setAttribute("additive", "sum");
        aniTrans.setAttribute("from", out ? "1 1" : "0.45 0.45");
        aniTrans.setAttribute("to", out ? "0.45 0.45" : "1 1");
        aniTrans.setAttribute("begin", "0s");
        aniTrans.setAttribute("dur", time + "ms");
        aniTrans.setAttribute("repeatCount", "indefinite");                                // бесконечная
        aniTrans.setAttribute("calcMode", "spline");
        aniTrans.setAttribute("keySplines", out ? "0.39, 0.575, 0.565, 1" : "0.47, 0, 0.745, 0.715");
        // aniMove.setAttribute("keyTimes", "0;0.5");

        // Подключение в DOM
        arrow.node.appendChild(aniTrans);
    };

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
            Math.round(color_max[0] * w1 + color_min[0] * w2),
            Math.round(color_max[1] * w1 + color_min[1] * w2),
            Math.round(color_max[2] * w1 + color_min[2] * w2),
        ];

        return '#' + Number(rgb[0]).toString(16) + Number(rgb[1]).toString(16) + Number(rgb[2]).toString(16);
    }
}