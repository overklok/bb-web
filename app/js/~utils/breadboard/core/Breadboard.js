import Grid from './Grid';

import SVG from 'svgjs'

const WRAP_WIDTH = 600;              // Ширина рабочей области
const WRAP_HEIGHT = 680;             // Высота рабочей области

// 260 = 1000
// 30 = 120
// 20 = 80

const GRID_MARGIN = {                 // Отступ сетки
    TOP:    65,
    LEFT:   40,
    RIGHT:  40,
    BOTTOM: 40
};

const GRID_ROWS = 11;                // Количество рядов в сетке точек
const GRID_COLS = 10;                // Количество колонок в сетке точек

const LABELS_HEIGHT = 24;           // Высота подписей (~кегль)
const LABELS_FONT_SIZE = 24;        // Кегль подписей
const LABELS = {
    X: ['  ', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
    Y: ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '+', '-']
};

/**
 * Класс, отвечающий за разметку рабочей среды
 *
 * Управляет контейнерами и их содержимым.
 * SVG-контейнеры хранятся в this.containers:
 *
 *  -wrap               Основная обёртка. За её пределы ничего не может выходить
 *  -grid               Сетка точек
 *  -label_panes.left   Левая панель подписей для сетки точек
 *  -label_panes.right  Правая панель подписей для сетки точек
 *
 * @constructor
 * @class
 */
class Breadboard {
    constructor() {
        // Контейнеры, перечисленные выше
        // Объект заполняется функцией _initContainers()
        this.containers = {};

        if (!SVG.supported) {
            alert("SVG in not supported. Please use any modern browser.");
        }
    }

    /**
     * Привести рабочую среду в исходное состояние,
     * которое видит пользователь при загрузке страницы
     *
     * Запускать в $(document).ready()
     *
     * @param {object} dom_node DOM-элемент
     */
    start(dom_node) {
        if (dom_node === undefined) {
            throw new TypeError("Breadboard::start(): DOM node is undefined");
        }

        // Базовая кисть
        this.brush = SVG(dom_node).size(WRAP_WIDTH, WRAP_HEIGHT);
        this.brush.node.setAttribute("viewBox", "0 0 " + WRAP_WIDTH + " " + WRAP_HEIGHT);

        this._defineFilters();

        // Инициализация контейнеров
        this._initContainers(this.brush);

        // Размещение контейнеров в рабочей среде
        this._composeContainers(true);

        this._drawBackground();

        // Создать логический объект "Сетка точек"
        this.grid = new Grid(this.containers.grid, GRID_ROWS, GRID_COLS);

        // Отрисовать элементы сетки в контейнере
        this.grid.drawDots();

        // Отрисовать панели с подписями
        this._drawLabelPanes();
    };

    clear() {
        this.brush.node.remove();
    }

    /**
     * Инициализировать контейнеры
     *
     * Заполняется объект this.containers
     *
     * @param brush кисть, рисующая в заданной области
     * @private
     */
    _initContainers(brush) {
        // Главная обёртка
        this.containers.wrap = brush.nested();

        // В ней - фон, сетка и панели подписей
        this.containers.background  = this.containers.wrap.nested();
        this.containers.grid        = this.containers.wrap.nested();

        this.containers.label_panes = {
            left: this.containers.wrap.nested(),    // левая
            top: this.containers.wrap.nested()      // и верхняя
        };
    };

    /**
     * Скомпоновать (разметить) контейнеры в рабочей области
     *
     * @param {Boolean} debug режим отладки
     * @private
     */
    _composeContainers(debug = false) {
        if (debug) {
            this.containers.wrap.rect('100%', '100%').fill({opacity: 0}).stroke({color: 'black', width: 1});
            this.containers.grid.rect('100%', '100%').fill({opacity: 0}).stroke({color: 'red', width: 1});
            this.containers.label_panes.left.rect('100%', '100%').fill({opacity: 0}).stroke({color: 'green', width: 1});
            this.containers.label_panes.top.rect('100%', '100%').fill({opacity: 0}).stroke({color: 'blue', width: 1});
        }

        // Ресайз сетки
        this.containers.grid.width (WRAP_WIDTH  - (GRID_MARGIN.RIGHT + GRID_MARGIN.LEFT));
        this.containers.grid.height(WRAP_HEIGHT - (GRID_MARGIN.TOP + GRID_MARGIN.BOTTOM));

        // Смещение сетки
        this.containers.grid.move(GRID_MARGIN.LEFT, GRID_MARGIN.TOP);

        // Ресайз панелей
        this.containers.label_panes.top.width(this.containers.grid.width());
        this.containers.label_panes.top.height(LABELS_HEIGHT);

        this.containers.label_panes.left.width(LABELS_HEIGHT);
        this.containers.label_panes.left.height(this.containers.grid.height());

        // Смещение панелей
        this.containers.label_panes.left.move(GRID_MARGIN.LEFT - LABELS_HEIGHT / 2, GRID_MARGIN.TOP);  // левая - сверху
        this.containers.label_panes.top.move(GRID_MARGIN.LEFT, GRID_MARGIN.TOP - LABELS_HEIGHT / 2);   // верхняя - слева
    };

    /**
     * Нарисовать фон макетной платы
     *
     * Наполняется контейнер  this.containers.background
     */
    _drawBackground() {
        // this.containers.background.rect('100%', '100%')
        //                           .fill('#f06');
    }

    /**
     * Нарисовать панели текстовых подписей для сетки
     *
     * Наполняются контейнеры   this.containers.label_panes.left,
     *                          this.containers.label_panes.right,
     *
     * @private
     */
    _drawLabelPanes() {
        // Используем сокращения
        let left = this.containers.label_panes.left;
        let top = this.containers.label_panes.top;

        // Отрисовать сами текстовые метки
        this._drawLabels(left, GRID_ROWS);
        this._drawLabels(top, GRID_COLS);
    };

    /**
     * Нарисовать текстовые метки в какой-либо панели (левой или верхней)
     *
     * @param label_pane ссылка на панель-контейнер
     * @param grd_steps  число колонок/рядов
     * @private
     */
    _drawLabels(label_pane, grd_steps) {
        // Проходим циклом по всем колонокам/рядам
        for (let iter = 0; iter < grd_steps; iter++)
        {
            // Текстовое содержимое метки по умолчанию
            let text = 'UNSET';
            // Цвет по умолчанию - чёрный
            let color = "#000";
            // Выравнивание по умоланию - по центру
            let align = "middle";

            if (this.containers.label_panes.left === label_pane) {
                // Если панель - слева

                // Выравнивание - по концу строки
//                 align = "end";

                if (iter in LABELS.Y) {
                    text = LABELS.Y[iter];
                }
            } else {
                // Если панель - сверху

//                 align = "middle"

                if (iter in LABELS.X) {
                    text = LABELS.X[iter];
                }
            }

            // Непосредственно формирование текста
            let label = label_pane
                .text(text)
                .font({fill: color, anchor: align, size: LABELS_FONT_SIZE});

            // Размещение текста зависит от того, левая панель или верхняя
            if (this.containers.label_panes.left === label_pane) {
                // Если левая панель
                label.move(
                    LABELS_HEIGHT / 2,
                    this.grid.dots[0][iter].y() - LABELS_FONT_SIZE / 2,
                );
            }

            if (this.containers.label_panes.top === label_pane) {
                // Если верхняя панель
                label.move(
                    this.grid.dots[iter][0].x() + this.grid.dots[iter][0].width() / 2,
                    0,
                );
            }
        }
    };

    /**
     * Определить SVG-фильтры
     *
     * @private
     */
    _defineFilters() {
        let filters = [];

        // Свечение чёрным (по обывательски - тень)
        filters.push(
            '<filter id="black-glow" filterUnits="userSpaceOnUse">\
                <feColorMatrix type="matrix" values=\
                        "0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0.7 0"/>\
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        // Свечение цветом обрабатываемого элемента
        filters.push(
            '<filter id="glow" filterUnits="userSpaceOnUse">\
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        // Фильтры должны храниться в этом узле
        let defs_elem = document.getElementsByTagName("defs")[0];

        defs_elem.insertAdjacentHTML('beforeend', filters[0]);
        defs_elem.insertAdjacentHTML('beforeend', filters[1]);
    };

}

export default Breadboard;
