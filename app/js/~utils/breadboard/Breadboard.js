import SVG from 'svgjs'

import Grid from "./core/Grid";
import BackgroundLayer from "./layers/BackgroundLayer";
import LabelLayer from "./layers/LabelLayer";
import CurrentLayer from "./layers/CurrentLayer";
import PlateLayer from "./layers/PlateLayer";

const WRAP_WIDTH = 1500;              // Ширина рабочей области
const WRAP_HEIGHT = 1500;             // Высота рабочей области

const GRID_WIDTH = 1000;
const GRID_HEIGHT = 1100;

const GRID_GAP_X = 10;
const GRID_GAP_Y = 10;

const GRID_ROWS = 11;                // Количество рядов в сетке точек
const GRID_COLS = 10;                // Количество колонок в сетке точек

/**
 * Класс, отвечающий за разметку рабочей среды
 *
 * Управляет контейнерами и их содержимым.
 * SVG-контейнеры хранятся в this._containers:
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
        if (!SVG.supported) {
            alert("SVG in not supported. Please use any modern browser.");
        }

        this._brush = undefined;
        this._grid  = undefined;

        this._layers = {
            background: undefined,
            label:      undefined,
            plate:      undefined,
            current:    undefined,
        };
    }

    addPlate(type, x, y, orientation, id=null, extra=null) {
        return this._layers.plate.addPlate(type, x, y, orientation, id, extra);
    }

    clearPlates() {
        this._layers.plate.removeAllPlates();
    }

    /**
     * Привести рабочую среду в исходное состояние,
     * которое видит пользователь при загрузке страницы
     *
     * Запускать в $(document).ready()
     *
     * @param {object} dom_node DOM-элемент
     */
    inject(dom_node) {
        if (dom_node === undefined) {
            throw new TypeError("Breadboard::inject(): DOM node is undefined");
        }

        // Базовая кисть
        this._brush = SVG(dom_node).size(WRAP_WIDTH, WRAP_HEIGHT);
        this._brush.node.setAttribute("viewBox", "0 0 " + WRAP_WIDTH + " " + WRAP_HEIGHT);
        this._brush.node.style.width = "100%";
        this._brush.node.style.height = "100%";

        this._grid = new Grid(GRID_ROWS, GRID_COLS, GRID_WIDTH, GRID_HEIGHT, GRID_GAP_X, GRID_GAP_Y);

        /// Создать фильтры
        Breadboard._defineFilters();
        /// Инициализировать слои
        this._composeLayers();
    };

    dispose() {
        this._brush.node.remove();
        this._layers = {};
    }

    /**
     * Инициализировать контейнеры
     *
     * @private
     */
    _composeLayers() {
        // В ней - фон, сетка и панели подписей
        let background  = this._brush.nested();
        let label_panes = this._brush.nested();
        let current     = this._brush.nested();
        let plate       = this._brush.nested();

        this._layers.background = new BackgroundLayer(background, this._grid);
        this._layers.label      = new LabelLayer(label_panes, this._grid);
        this._layers.current    = new CurrentLayer(current, this._grid);
        this._layers.plate      = new PlateLayer(plate, this._grid);

        this._layers.background.compose();
        this._layers.label.compose();
        this._layers.current.compose();
        this._layers.plate.compose();
    }

    static _defineFilters() {
        let filters = [];

        // Свечение чёрным (тень)
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
