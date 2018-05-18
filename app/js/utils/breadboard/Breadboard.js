import SVG from 'svgjs'

import Grid from "./core/Grid";
import BackgroundLayer from "./layers/BackgroundLayer";
import LabelLayer from "./layers/LabelLayer";
import CurrentLayer from "./layers/CurrentLayer";
import PlateLayer from "./layers/PlateLayer";

const WRAP_WIDTH = 1200;              // Ширина рабочей области
const WRAP_HEIGHT = 1350;             // Высота рабочей области

const GRID_WIDTH = 1000;
const GRID_HEIGHT = 1100;

const GRID_GAP_X = 10;
const GRID_GAP_Y = 10;

const GRID_ROWS = 11;                // Количество рядов в сетке точек
const GRID_COLS = 10;                // Количество колонок в сетке точек


export default class Breadboard {
    constructor(options) {
        if (!SVG.supported) {
            alert("SVG is not supported. Please use any modern browser.");
        }

        this._brush = undefined;
        this._grid  = undefined;

        this._layers = {
            background: undefined,
            label:      undefined,
            plate:      undefined,
            current:    undefined,
        };

        this._callbacks = {
            change: () => {},
        };

        this._cache = {
            current: undefined,
        };
    }

    getContainer() {
        if (!this._brush) {
            return null;
        }

        return this._brush.node;
    }

    getPlates() {
        return this._layers.plate.getCurrentPlatesData();
    }

    addPlate(type, x=0, y=0, orientation='west', id=null, extra) {
        return this._layers.plate.addPlate(type, x, y, orientation, id, extra);
    }

    setPlateState(plate_id, state) {
        this._layers.plate.setPlateState(plate_id, state);
    }

    highlightPlates(plate_ids, on) {
        this._layers.plate.highlightPlates(plate_ids, on);
    }

    clearPlates() {
        this._layers.plate.removeAllPlates();
    }

    setCurrent(points) {
        // if (this._cache.current) {
        //     if (JSON.stringify(this._cache.current) === JSON.stringify(points)) {
        //         console.log("cache equal, return");
        //         return;
        //     }
        // } else {
        //     this._cache.current = points;
        // }

        this._layers.current.removeAllCurrents();
        this._layers.current.addCurrent(points);
    }

    clearCurrents() {
        this._layers.current.removeAllCurrents();
    }

    highlightRegion(from, to, clear) {
        this._layers.background.highlightRegion(from, to, clear);
    }

    clearRegions() {
        this._layers.background.clearRegions();
    }

    inject(dom_node, options) {
        if (dom_node === undefined) {
            throw new TypeError("Breadboard::inject(): DOM node is undefined");
        }

        this._setOptions(options);

        // Базовая кисть
        this._brush = SVG(dom_node).size(WRAP_WIDTH, WRAP_HEIGHT);
        this._brush.node.setAttribute("viewBox", "0 0 " + WRAP_WIDTH + " " + WRAP_HEIGHT);
        this._brush.node.style.width = "100%";
        this._brush.node.style.height = "100%";

        this._brush.style({"user-select": "none"});

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

    onChange(cb) {
        if (!cb) {this._callbacks.change = () => {}}

        this._callbacks.change = cb;
    }


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

        if (!this._options.readOnly) {
            this._layers.plate.onChange((data) => {this._callbacks.change(data)});
        }

        if (this._options.readOnly) {
            this._layers.plate.setEditable(false);
        } else {
            this._layers.plate.setEditable(true);
        }
    }

    _setOptions(options) {
        options = options || {};

        this._options = {
            readOnly: (options.readOnly === undefined) ? true : options.readOnly,
        }
    }

    static getAllPlateTypes() {
        return PlateLayer._getAllPlateTypes();
    }

    static _defineFilters() {
        let defs = [];

        // Свечение чёрным (тень)
        defs.push(
            '<filter id="glow-led" filterUnits="userSpaceOnUse">\
                <feColorMatrix type="matrix" values=\
                        "0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0.3   0"/>\
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        defs.push(
            // Свечение чёрным (тень)
            '<filter id="glow-black" filterUnits="userSpaceOnUse">\
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

        defs.push(
            // Свечение цветом обрабатываемого элемента
            '<filter id="glow" filterUnits="userSpaceOnUse">\
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        defs.push(
            // Свечение голубым цветом
            '<filter id="glow-plate" filterUnits="userSpaceOnUse">\
                <feColorMatrix type="matrix" values=\
                        "0 0 0 0   0\
                         0 1 0 0   0\
                         0 0 1 0   0\
                         0 0 0 0.8 0"/>\
                <feGaussianBlur stdDeviation="20" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        defs.push(
            // Свечение голубым цветом
            '<filter id="glow-current" filterUnits="userSpaceOnUse">\
                <feColorMatrix type="matrix" result="colorCurrentCyan" values=\
                        "0 0 0 0   0\
                         0 1 0 0   0\
                         0 0 1 0   0\
                         0 0 0 1   0"/>\
                <feColorMatrix type="matrix" result="colorCurrentWhite" values=\
                        "1 1 1 0   0\
                         1 1 1 0   0\
                         1 1 1 0   0\
                         0 0 0 0.5 0"/>\
                <feGaussianBlur in="colorCurrentWhite" stdDeviation="1" result="coloredBlurIn"/>\
                <feGaussianBlur in="colorCurrentCyan" stdDeviation="10" result="coloredBlurOut"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlurOut"/>\
                    <feMergeNode in="SourceGraphic"/>\
                    <feMergeNode in="coloredBlurIn"/>\
                </feMerge>\
            </filter>'
        );

        // defs.push(
        // );

        // Фильтры должны храниться в этом узле
        let defs_elem = document.getElementsByTagName("defs")[0];

        defs_elem.insertAdjacentHTML('beforeend', defs[0]);
        defs_elem.insertAdjacentHTML('beforeend', defs[1]);
        defs_elem.insertAdjacentHTML('beforeend', defs[2]);
        defs_elem.insertAdjacentHTML('beforeend', defs[3]);
        defs_elem.insertAdjacentHTML('beforeend', defs[4]);
        // defs_elem.insertAdjacentHTML('beforeend', defs[5]);
    };
}
