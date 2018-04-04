const GRID_DOT_SIZE = 20;           // Радиус точек

//TODO: сделать градиент, по центру - белый, по бокам - синий, со свечением
const CURRENT_ANIM_DELTA    = 40;           // Расстояние между соседними стрелками, px

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
    constructor(container, style) {
        this.container = container;
        this.style = style;
        this.path = null;

        this.container_anim = this.container.nested();

        this._visible = false;
    }

    /**
     * Отрисовать контур тока по заданному пути
     *
     * Применяется фильтр свечения.
     *
     * @param path
     */
    draw(path) {
        this.path = this.container
            .path(path)
            .addClass('current-path')
            .fill('none')
            .stroke(this.style)
            .data('key', 'value');

        this.container_anim.before(this.path);
        this.container_anim.opacity(0);

        this.addGlow();

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

        this.path.remove();
        this.container_anim.remove();

        this._visible = false;
    };

    /**
     * Анимировать ток по контуру this.path
     *
     * @param speed       Скорость анимации тока (движения стрелок по контуру)
     * @param arrow_color Цвет стрелки, обозначающей ток
     *
     * Генерируется некоторое число стрелок - векторных объектов, изображающих ток по контуру.
     * Каждая стрелка циклически проходит фрагмент пути длины delta с заданной скоростью speed
     * таким образом, что путь движения каждой последующей стрелки берёт начало в том месте,
     * где предыдущая заканчивает итерацию цикла движения.
     *
     */
    activate(speed, arrow_color) {
        if (!this._visible) {
            throw new Error("Cannot activate invisible current!");
        }

        // Рассчитаем длину контура
        let length = this.path.length();

        // Определим число стрелок
        let arrows_count = Math.floor(length) / (CURRENT_ANIM_DELTA);

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
            let arrow = this.container_anim.polygon(
                "0,0 0," + GRID_DOT_SIZE/2 +  " " + GRID_DOT_SIZE / 4 + "," + GRID_DOT_SIZE / 4
            ).center(0,0).addClass('current-arrow');

            // Заливка и центрирование
            arrow.fill(arrow_color);

            // SVG-анимация стрелки:
            let aniMove = document.createElementNS("http://www.w3.org/2000/svg","animateMotion"); // тип: перемещение
                aniMove.setAttribute("start", "0s");                                              // задержка
                aniMove.setAttribute("dur", time + "ms");                                          // длительность
                aniMove.setAttribute("repeatCount", "indefinite");                                // бесконечная
                aniMove.setAttribute("rotate", "auto");                                           // автоповорот
                aniMove.setAttribute("keyPoints", progress_start + ";" + progress_end);           // нач. и кон. позиции в %
                aniMove.setAttribute("keyTimes", "0;1");                                          // нач. и кон. время в %
                aniMove.setAttribute("calcMode", "linear");                                       // (!) функция перемещения

            // В аниматор нужно вставить путь анимации
            let mpath = document.createElementNS("http://www.w3.org/2000/svg","mpath");
                mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.path.toString());

            // Подключение в DOM
            aniMove.appendChild(mpath);
            arrow.node.appendChild(aniMove);
        }

        let self = this;

        // Это необходимо для того, чтобы дать браузеру вставить анимацию во все полигоны
        // В противном случае, на малую долю секунды будет заметна частица в положении (0,0)
        // до начала анимации
        setTimeout(function () {
            self.container_anim.opacity(1);
        }, 0);
    };

    /**
     * Остановить анимацию тока
     */
    deactivate() {
        this.container_anim.clear();
    };

    /**
     * Добавить фильтр свечения к току
     */
    addGlow() {
        this.path.attr('filter', 'url(#glow-current)');
    };
}