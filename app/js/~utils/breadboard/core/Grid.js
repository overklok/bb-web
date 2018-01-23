import Current from './Current';

const GRID_DOT_SIZE = 5;           // Радиус точек
const GRID_DOT_BEZEL_SIZE = 40      // Размер окантовки точки

//TODO: сделать градиент, по центру - белый, по бокам - синий, со свечением
const CURRENT_COLOR_GOOD    = '#7DF9FF';    // Цвет тока здорового человека
const CURRENT_COLOR_BAD     = '#f00';       // Цвет тока курильщика

const CURRENT_ARROW_COLOR   = '#00f';       // Цвет стрелок тока

const CURRNT_ANIM_SPEED     = 1;            // Скорость анимации стрелок, arrows/sec

/**
 * Класс "Сетка точек"
 *
 * Характеризуется следующими свойствами:
 * this.container - контейнер, в котором отрисовывается сетка точек
 * this.size      - размеры сетки точек (количество колонок и рядов)
 * this.dots      - массив SVG-точек с рассчитанными координатами
 * this.currents  - массив токов, инициированных на текущей сетке
 * this.elements  - массив элементов цепи (ссылок на объекты классов из elements.js)
 *
 * МАССИВ ТОЧЕК [this.dots]
 * В массиве точек хранятся ссылки на SVG-объекты с координатами точек.
 * Расположение точек зависит от ширины и высоты контейнера, которые задаются
 * функцией this.drawDots(). Это позволит установить соответствие между
 * номерами ряда и колонки и реальными (пиксельными) координатами точек.
 *
 * МАССИВ ЭЛЕМЕНТОВ СЕТКИ [this.elements]
 * Массиве элементов сетки хранит необходимую информацию для отрисовки ТОКОВ,
 * проходящих через элементы. По адресу [x][y] хранится список элементов, которые подключены к
 * точке с координатами (x, y). Это позволяет прорисовывать токи в элементах в зависимости от
 * входов и выходов в эти элементы.
 *
 *
 * КАК ИСПОЛЬЗОВАТЬ КЛАСС:
 *
 * var grid = new Grid(c, r, w);                        // новый экземляр класса
 * grid.drawDots(w, h);                                 // сгенерировать массив точек
 *
 * var rh_id = grid.addElement(Resistor, options_elem); // добавить элемент "резистор" на сетку
 *
 * grid._addCurrent(points, options_curr);               // добавить ток на сетку
 *
 * @param container контейнер, в котором отрисовывается сетка точек
 * @param rows Количество рядов
 * @param cols Количество колонок
 * @class
 */
class Grid {
    constructor(container, rows, cols) {
        this.container = container;
        this.dots_container = this.container.nested();           // SVG-контейнер, где будут отрисованы точки
        this.elem_container = this.container.nested();           // SVG-контейнер, где будут отрисованы элементы

        this.size = {x: cols, y: rows};                     // Размер сетки (количество рядов и колонок)

        this.elements = [];                                 // Массив элементов
        this.currents = [];

        this.dots = [];                                     // Массив точек
    }

    /**
     * Добавить элемент на сетку
     *
     * Создаётся новый объект заданного класса элементов цепи.
     * Происходит копирование ссылки на созданный элемент.
     * Затем элемент выводится на экран.
     *
     * @param element_class                 класс элементов цепи (из elements.js)
     * @param dots_inp      Object|Array    координаты входа(ов) элемента
     * @param dots_out      Object|Array    координаты выхода(ов) элемента
     * @param state         Optional        состояние элемента
     *
     * @returns int Идентификатор объекта
     */
    addElement(element_class, dots_inp, dots_out, state) {
        // Создаём экземпляр класса элемента
        let elem = new element_class(this.elem_container, state);

        // Количество аргументов
        let argc = arguments.length;

        // Доп. аргументов не должно быть меньше 2-х
        if (argc < 3) {
            console.warn("[Grid]: Not enough arguments in addElement call");
            return null;
        }

        // Скопировать ссылку на элемент
        this._linkElement(elem, dots_inp, dots_out);

        let self = this;

        // Преобразовать координаты (для каждого массива аргументов)
        if (Array.isArray(dots_inp)) {
            for (let [index, dot_inp] of dots_inp) {
                dots_inp[index] = self._convertDotCoordsToPixels(dot_inp);
            }
        } else {
            dots_inp = self._convertDotCoordsToPixels(dots_inp);
        }

        if (Array.isArray(dots_out)) {
            for (let [index, dot_out] of dots_out) {
                dots_out[index] = self._convertDotCoordsToPixels(dot_out);
            }
        } else {
            dots_out = self._convertDotCoordsToPixels(dots_out);
        }

        // Отобразить объект
        elem.draw(dots_inp, dots_out);

        return elem.id;
    };

    /**
     * Удалить все элементы с сетки
     */
    removeAllElements() {
        // Очистить контейнер с элементами
        this.elem_container.clear();

        // Удалить все ссылки из памяти
        this.elements = [];
    };

    /**
     * Добавить хороший ток
     * @param points    Массив координат контура тока (по формату см. описание _addCurrent)
     */
    addCurrentGood(points) {
        this._addCurrent(points, CURRENT_COLOR_GOOD);
    };

    /**
     * Добавить плохой ток
     * @param points    Array   Массив координат контура тока (по формату см. описание _addCurrent)
     */
    addCurrentBad(points) {
        this._addCurrent(points, CURRENT_COLOR_BAD);
    };

    /**
     * Удалить все токи с сетки
     */
    removeAllCurrents() {
        for (current in this.currents) {
            current.erase();
        }

        this.currents = [];
    };

    /**
     * Анимировать все токи
     */
    activateAllCurrents() {
        for (current of this.currents) {
            current.activate();
        }
    };

    /**
     * Остановить все токи
     */
    deactivateAllCurrents () {
        for (current of this.currents) {
            current.deactivate();
        }
    }

    /**
     * Нарисовать сетку точек
     *
     * Наполняет массив this.dots, генерируя координаты точек.
     *
     * Если не вызвать эту функцию перед каким-либо другим методом (кроме конструктора),
     * произойдёт сбой. Все функции требуют вычисленные значения координат точек.
     *
     * При необходимости изменить ширину и/или длину сетки следует вызвать эту функцию повторно.
     *
     * @private
     */
    drawDots() {
        // Массив ссылок на отрисованные точки
        this.dots = [];

        // Цикл по рядам
        for (let xi = 0; xi < this.size.x; xi++) {

            if (!(xi in this.dots)) {
                this.dots[xi] = [];
            }

            // Цикл по колонкам
            for (let yi = 0; yi < this.size.y; yi++)
            {
                let mv_x = ((this.container.width()) / (this.size.x + 1) * (xi));
                let mv_y = ((this.container.height()) / (this.size.y + 1) * (yi));

                mv_x += GRID_DOT_BEZEL_SIZE;
                mv_y += GRID_DOT_BEZEL_SIZE;                

                this.dots[xi][yi] =
                    this.dots_container
                        .circle(GRID_DOT_SIZE)
                        .move(
                            mv_x,
                            mv_y
                        );

                this.dots_container
                    .rect(
                        GRID_DOT_BEZEL_SIZE,
                        GRID_DOT_BEZEL_SIZE
                    )
                    .move(
                        this.dots[xi][yi].x() + (GRID_DOT_SIZE - GRID_DOT_BEZEL_SIZE) / 2,
                        this.dots[xi][yi].y() + (GRID_DOT_SIZE - GRID_DOT_BEZEL_SIZE) / 2,
                    )
                    .fill({
                        opacity: 0.5
                    });
            }
        }
    };

    /**
     * Добавить ток на сетку
     * Новый ток автоматически активируется.
     *
     * @param points  Array     Массив координат контура тока в формате
     *                          {inp: {x: int, y: int}, out: {x: int, y:int}}
     * @param c_color String    Цвет контура тока
     * @private
     */
    _addCurrent(points, c_color) {
        let path_data = this._buildCurrentPath(points);

        this.currents.push(new Current(this.container, {
            color: c_color,
            width: GRID_DOT_SIZE/2,
            linecap: "round"
        }));

        this.currents[this.currents.length - 1].draw(path_data);
        this.currents[this.currents.length - 1].activate(CURRNT_ANIM_SPEED, CURRENT_ARROW_COLOR);
    };

    /**
     * Создать ссылку на элемент в массив элементов
     *
     * Создаётся новый объект заданного класса элементов цепи,
     * Происходит копирование ссылки на созданный элемент
     *
     * @param element                       экземпляр класса элементов цепи (из elements.js)
     * @param dots_inp      Object|Array    координаты входа(ов) элемента
     * @param dots_out      Object|Array    координаты выхода(ов) элемента
     * @private
     */
    _linkElement(element, dots_inp, dots_out) {
        let self = this;

        if (Array.isArray(dots_inp)) {
            for (dot_inp of dots_inp) {
                self._copyLinkToElements(element, dot_inp);
            }
        } else {
            self._copyLinkToElements(element, dots_inp);
        }

        if (Array.isArray(dots_out)) {
            for (dot_out of dots_out) {
                self._copyLinkToElements(element, dot_out);
            }
        } else {
            self._copyLinkToElements(element, dots_out);
        }
    };

    /**
     * Скопировать ссылку на элемент в массив элементов
     *
     * Вспомогательный метод для безопасного копирования
     *
     * @param element   экземпляр класса элементов цепи (из elements.js)
     * @param dot       координаты элемента
     * @private
     */
    _copyLinkToElements(element, dot) {
        if (!(dot.x in this.elements)) {
            this.elements[dot.x] = [];
        }

        if (!(dot.y in this.elements[dot.x])) {
            this.elements[dot.x][dot.y] = [];
        }

        this.elements[dot.x][dot.y].push(element);
    };

    /**
     * Построить SVG-контур прохождения тока
     *
     * @param points    Пары точек в формате {inp: {x: int, y: int}, out: {x: int, y: int}}
     * @private
     * @returns {Array} SVG-контур
     */
    _buildCurrentPath(points) {
        let full_path = [];
        let self = this;

        // Для каждой пары точек
        for (point of points) {
            let elements = new Set();

            let pixel_inp = self._convertDotCoordsToPixels(point.inp);
            let pixel_out = self._convertDotCoordsToPixels(point.out);

            // Если в массиве элементов ВХОДНАЯ точка ссылается на что-либо
            if (point.inp.x in self.elements && point.inp.y in self.elements[point.inp.x]) {
                // Для каждого из элементов, находящихся в этой точке
                for(element of self.elements[point.inp.x][point.inp.y]) {
                    element.addInput(pixel_inp);    // Добавить вход к элементу
                    elements.add(element);          // Добавить элемент в множество
                }
            }

            // Если в массиве элементов ВЫХОДНАЯ точка ссылается на что-либо
            if (point.out.x in self.elements && point.out.y in self.elements[point.out.x]) {
                // Для каждого из элементов, находящихся в этой точке
                for(element of self.elements[point.out.x][point.out.y]) {
                    element.addOutput(pixel_out);   // Добавить выход к элементу
                    elements.add(element);          // Добавить элемент в множество
                }
            }

            // Имеем множество elements, состоящее из элементов, которых хоть как-то
            // "касается" наша точка.

            // Теперь попытаемся дорисовать путь с помощью стронних генераторов контура.
            // Будем считать количество успешных попыток:
            let appended = 0;

            for (element of elements) {
                // Попытка была
                appended++;

                if (!element.appendCurrentPath(full_path)) {
                    // Попытка неуспешна
                    appended--;
                }

                // Нужно очистить вохды и выходы в объекте
                element.removeIOs();
            }

            // Если не было неуспешных попыток, можно уверенно рисовать линию (элемент точно подсвечивается)
            if (appended === 0) {
                self._appendLinePath(full_path, pixel_inp, pixel_out);
            }

            // Если множество пустое, то, скорее всего, нужно нарисовать обычную линию:
            if (elements.size === 0) {
                self._appendLinePath(full_path, pixel_inp, pixel_out);
            }

        }

        return full_path;
    };

    /**
     * Преобразовать координаты из абстрактной формы в пиксельную
     *
     * @private
     * @param dot
     */
    _convertDotCoordsToPixels(dot) {
        return {
            x: this.dots[dot.x][dot.y].x(),
            y: this.dots[dot.x][dot.y].y()
        }
    };

    /**
     * Достроить контур прямой линией
     *
     * @param path
     * @param point_inp
     * @param point_out
     * @private
     * @returns {Boolean}
     */
    _appendLinePath(path, point_inp, point_out) {
        let dot_inc = GRID_DOT_SIZE / 2;

        path.push([
            'M',
            point_inp.x + dot_inc,
            point_inp.y + dot_inc
        ]);
        path.push([
            'L',
            point_inp.x + dot_inc,
            point_inp.y + dot_inc
        ]);
        path.push([
            'L',
            point_out.x + dot_inc,
            point_out.y + dot_inc
        ]);

        return true;
    };
}

export default Grid;
