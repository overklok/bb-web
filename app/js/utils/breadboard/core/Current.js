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
    static get SpeedMin() {return 600}
    static get SpeedMax() {return 1000}
    static get AnimationDelta() {return 100} // Расстояние между соседними стрелками, px

    constructor(container, points, style) {
        this.container = container;
        this.style = style;
        this.path = null;
        this.arrows = [];
        this.thread = points;
        this._weight = 0;
        this._time = undefined;

        /// Идентификатор - по умолчанию случайная строка
        this._id = Math.floor(Math.random() * (10 ** 6));

        this.container_anim = this.container.nested();
        this.animators = {
            move: [],
            trans: []
        };

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
        this.style.color = Current.pickColorFromRange(weight);

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

        // this.path.opacity(0).animate('50ms').opacity(1);

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

        // this.path.animate('50ms').opacity(0);
        // this.container_anim.animate('50ms').opacity(0);

        // setTimeout(() => {
            this.path.remove();
            this.container_anim.remove();
        // }, 50);

        this._visible = false;
    };

    /**
     * Проверить, совпадает ли контур у тока
     *
     * @param {Object} thread контур
     * @returns {boolean}
     */
    hasSameThread(thread) {
        return  thread.from.x === this.thread.from.x &&
                thread.from.y === this.thread.from.y &&
                thread.to.x === this.thread.to.x &&
                thread.to.y === this.thread.to.y;
    }

    /**
     * Анимировать ток по контуру this.path
     *
     * @param weight    Скорость анимации тока (движения стрелок по контуру)
     * @param reset     Сбросить отрисованные стрелки
     *
     * Генерируется некоторое число стрелок - векторных объектов, изображающих ток по контуру.
     * Каждая стрелка циклически проходит фрагмент пути длины delta с заданной скоростью speed
     * таким образом, что путь движения каждой последующей стрелки берёт начало в том месте,
     * где предыдущая заканчивает итерацию цикла движения.
     *
     * Отключение сброса стрелок необходимо в случае, когда требуется изменить свойства анимации,
     * не перерисовывая стрелки с нуля.
     */
    activate(weight=0, reset=true, spare=false) {
        if (!this._visible) {
            throw new Error("Cannot activate invisible current!");
        }

        if (reset) {
            this.arrows = [];

            this.animators = {
                move: [],
                trans: []
            };
        }

        // let time = Math.ceil(Current.SpeedMax + weight * (Current.SpeedMin - Current.SpeedMax));
        let time = Current.SpeedMin;

        // Рассчитаем длину контура
        let length = this.path.length();

        // Определим число стрелок
        let arrows_count = Math.floor(length) / (Current.AnimationDelta);

        /// Сглаживание изменения скорости движения стрелок
        // if (!reset) {
        //     this.container_anim.node.setCurrentTime(
        //         this.container_anim.node.getCurrentTime() * time / this._time
        //     );
        // }

        /// Сохраним время (для случаев, когда функция будет вызываться повторно без reset)
        // this._time = time;

        // Для каждой стрелки:
        for (let i = 0; i < arrows_count; i++)
        {
            // Вычислить начальную и конечную позиции движения по контуру (в процентах от всей длины контура)
            let progress_start  = (  i  ) / arrows_count;
            let progress_end    = (i + 1) / arrows_count;

            // Если стрелка - последняя, то progress_end будет больше 1
            // Необходимо скорректировать конечную позицию для последней стрелки,
            // так как длина всего пути может быть не кратной количеству стрелок
            if (progress_end > 1) {
                progress_end = 1;
            }

            /// Если сброс - генерируемы новую стрелку
            if (reset) {
                let arrow;

                if (spare) {
                    arrow = this.container_anim.polygon(
                        "0,0 0," + GRID_DOT_SIZE * 2 +  " " + GRID_DOT_SIZE + "," + GRID_DOT_SIZE
                    );
                } else {
                    arrow = this.container_anim.circle(
                        GRID_DOT_SIZE * 1.8
                    ).addClass('current-arrow');
                }

                    arrow.center(0, 0);

                this.arrows.push(arrow);
            }

            // Заливка и центрирование
            this.arrows[i].fill(Current.pickColorFromRange(weight));

            let aniMove, aniTrans;

            aniMove = Current.animateArrowMove(
                this.path.toString(), this.arrows[i], time, progress_start, progress_end, spare, this.animators.move[i]
            );

            if (i === 0) {
                // если первая стрелка
                aniTrans = Current.animateArrowScale(this.arrows[i], time, false, spare, this.animators.trans[i]);
            }

            if (i === arrows_count - 1) {
                // если последняя стрелка
                aniTrans = Current.animateArrowScale(this.arrows[i], time, true, spare, this.animators.trans[i]);
            }

            if (reset) {
                this.animators.move.push(aniMove);
                this.animators.trans.push(aniTrans);
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

        this.animators = {
            move: [],
            trans: []
        };

        this.container_anim.clear();
    };

    /**
     * Добавить фильтр свечения к току
     */
    addGlow() {
        this.path.attr('filter', 'url(#glow-current)');
    };

    setWeight(weight=0) {
        weight = weight > 1 ? 1 : weight;

        if (this._weight !== weight) {
            this.activate(weight, false);

            let color = Current.pickColorFromRange(weight);

            this.path.stroke({color});

            for (let arw of this.arrows) {
                arw.fill(color);
            }

        }

        this._weight = weight;
    }

    static animateArrowMove(path, arrow, time, progress_start, progress_end, spare=false, animator=undefined) {
        // SVG-анимация стрелки:
        let aniMove = animator ? animator.node : document.createElementNS("http://www.w3.org/2000/svg", "animateMotion"); // тип: перемещение

        // В аниматор нужно вставить путь анимации
        let mpath = animator ? animator.path : document.createElementNS("http://www.w3.org/2000/svg", "mpath");

        if (animator === undefined) {
            mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + path.toString());

            aniMove.setAttribute("start", "0s");                                              // задержка
            aniMove.setAttribute("repeatCount", "indefinite");                                // бесконечная
            aniMove.setAttribute("rotate", "auto");                                           // автоповорот
            aniMove.setAttribute("keyTimes", "0;1");                                          // нач. и кон. время в %
            aniMove.setAttribute("calcMode", "linear");                                       // (!) функция перемещения
        }

        if (spare) {
            aniMove.removeAttribute("dur");
        } else {
            aniMove.setAttribute("dur", time + "ms"); // длительность
        }

        aniMove.setAttribute("keyPoints", progress_start + ";" + progress_end);       // нач. и кон. позиции в %

        // Подключение в DOM
        if (!animator) {
            aniMove.appendChild(mpath);
            arrow.node.appendChild(aniMove);
        }

        return {node: aniMove, path: mpath};
    };

    static animateArrowScale(arrow, time, out = false, spare, animator=undefined) {
        // SVG-анимация стрелки:
        let aniTrans = animator ? animator : document.createElementNS("http://www.w3.org/2000/svg", "animateTransform"); // тип: трансформ.

        if (animator === undefined) {
            aniTrans.setAttribute("attributeName", "transform");                               // радиус
            aniTrans.setAttribute("type", "scale");
            aniTrans.setAttribute("additive", "sum");
            aniTrans.setAttribute("begin", "0s");
            aniTrans.setAttribute("repeatCount", "indefinite");                                // бесконечная
            aniTrans.setAttribute("calcMode", "spline");
        }

        aniTrans.setAttribute("from", out ? "1 1" : "0.45 0.45");
        aniTrans.setAttribute("to", out ? "0.45 0.45" : "1 1");
        aniTrans.setAttribute("keySplines", out ? "0.39, 0.575, 0.565, 1" : "0.47, 0, 0.745, 0.715");

        if (spare) {
            aniTrans.removeAttribute("dur");
        } else {
            aniTrans.setAttribute("dur", time + "ms"); // длительность
        }

        // Подключение в DOM
        if (!animator) {
            arrow.node.appendChild(aniTrans);
        }

        return aniTrans;
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