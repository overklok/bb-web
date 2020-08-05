import SVG from 'svgjs'
import canvg from 'canvg';
import { saveAs } from 'file-saver';

import Grid from "./core/Grid";
import BackgroundLayer from "./layers/BackgroundLayer";
import LabelLayer from "./layers/LabelLayer";
import CurrentLayer from "./layers/CurrentLayer";
import PlateLayer from "./layers/PlateLayer";
import RegionLayer from "./layers/RegionLayer";
import ControlsLayer from "./layers/ControlsLayer";

import BoardContextMenu from "./menus/BoardContextMenu";

import thm from "./styles/main.css";
import {initGradients} from "./styles/gradients";
import SelectorLayer from "./layers/SelectorLayer";

const LAYOUTS = {
    Basic: {
        WRAP_WIDTH:     1200, // Ширина рабочей области
        WRAP_HEIGHT:    1350, // Высота рабочей области

        GRID_WIDTH:     1000,
        GRID_HEIGHT:    1100,

        GRID_GAP_X:     20,
        GRID_GAP_Y:     20,

        GRID_ROWS:      11,   // Количество рядов в сетке точек
        GRID_COLS:      10,   // Количество колонок в сетке точек

        GRID_POS_X:     120,
        GRID_POS_Y:     200,

        DOMAINS: [
            // Линия аналоговых пинов
            {
                horz: true, from: {x: 0, y: 0}, to: {x: -1, y: 0},
                style: BackgroundLayer.DomainSchematicStyles.None,
                role: LabelLayer.CellRoles.Analog
            },

            // Верхняя линия "+"
            {horz: true,    from: {x: 0, y: 1},     to: {x: -1, y: 1}, inv: true},

            // Нижняя линия "-"
            {horz: true,    from: {x: 0, y: -1},    to: {x: -1, y: -1}},

            // Две группы вертикальных линий
            {horz: false,   from: {x: 0, y: 2},     to: {x: -1, y: 5}},
            {horz: false,   from: {x: 0, y: 6},     to: {x: -1, y: 9}},
        ],

        POINTS: [
            Grid.AuxPointCats.Source,
        ],

        CONTROLS: {horz: true}
    },

    Advanced: {
        WRAP_WIDTH:     850,  // Ширина рабочей области
        WRAP_HEIGHT:    1300, // Высота рабочей области

        GRID_WIDTH:     580,
        GRID_HEIGHT:    1180,

        GRID_GAP_X:     10,
        GRID_GAP_Y:     10,

        GRID_ROWS:      16,   // Количество рядов в сетке точек
        GRID_COLS:      8,   // Количество колонок в сетке точек

        GRID_POS_X:     190,
        GRID_POS_Y:     70,

        DOMAINS: [
            // Верхняя линия
            {
                horz: true, from: {x: 0, y: 0}, to: {x: 3, y: 0},
                role: LabelLayer.CellRoles.Plus, inv: true,
                label_pos: "top",
            },
            {
                horz: true, from: {x: 4, y: 0}, to: {x: -1, y: 0},
                role: LabelLayer.CellRoles.Analog,
                style: BackgroundLayer.DomainSchematicStyles.Dotted,
                pins_from: 0, inv: true,
                before: 1,
                label_pos: "top"
            },

            // Нижняя линия
            {
                horz: true,
                from: {x: 0, y: 15}, to: {x: 3, y: 15},
                role: LabelLayer.CellRoles.Plus,
                label_pos: "bottom",
            },
            {
                horz: true,
                from: {x: 4, y: 15}, to: {x: -1, y: 15},
                role: LabelLayer.CellRoles.Analog,
                style: BackgroundLayer.DomainSchematicStyles.Dotted,
                pins_to: 11,
                before: 1,
                label_pos: "bottom"
            },

            // Три группы вертикальных линий
            {horz: false, from: {x: 0, y: 1},   to: {x: -2, y: 5}},
            {horz: false, from: {x: 0, y: 6},   to: {x: -2, y: 9}},
            {horz: false, from: {x: 0, y: 10},  to: {x: -2, y: 14}},

            // Тройные линии в верхней и нижней группах
            {horz: false, from: {x: -1, y: 1},  to: {x: -1, y: 3}},
            {horz: false, from: {x: -1, y: 12}, to: {x: -1, y: 14}},

            // Двойные линии в средней группе
            {horz: false, from: {x: -1, y: 8},  to: {x: -1, y: 9}},
            {horz: false, from: {x: -1, y: 6},  to: {x: -1, y: 7}},

            // Одиночные контакты - аналоговые пины
            {horz: false, from: {x: -1, y: 4},  to: {x: -1, y: 4},  role: LabelLayer.CellRoles.Analog, pins_from: 4},
            {horz: false, from: {x: -1, y: 5},  to: {x: -1, y: 5},  role: LabelLayer.CellRoles.Analog, pins_from: 5},
            {horz: false, from: {x: -1, y: 10}, to: {x: -1, y: 10}, role: LabelLayer.CellRoles.Analog, pins_from: 6},
            {horz: false, from: {x: -1, y: 11}, to: {x: -1, y: 11}, role: LabelLayer.CellRoles.Analog, pins_from: 7},
        ],

        POINTS: [
            Grid.AuxPointCats.Usb1,
            Grid.AuxPointCats.Usb3,
        ],

        CONTROLS: {horz: false},
    }
}


/**
 * Основной класс платы.
 * Предоставляет API управления визуализацией платы внешним модулям приложений
 */
export default class Breadboard {
    static get CellRadius() {return 5}
    static get Layouts() {return LAYOUTS}

    constructor(options) {
        if (!SVG.supported) {
            alert("SVG is not supported. Please use any modern browser.");
        }

        this._brush = undefined;
        this.__grid  = undefined;

        this._layers = {
            background: undefined,
            label:      undefined,
            plate:      undefined,
            current:    undefined,
            region:     undefined,
            controls:   undefined,
            selector:   undefined,
        };

        this._callbacks = {
            change: () => {},
            dragstart: () => {},
            shortcircuitstart: () => {},
            shortcircuitend: () => {},
        };

        this._cache = {
            current: undefined,
        };

        this._dom_node_parent = undefined;

        this._spare = false;
        this._filters_defined = false;

        this._schematic = false;
        this._detailed = false;
        this._verbose = false;
    }

    getContainer() {
        if (!this._brush) {
            return null;
        }

        return this._brush.node;
    }

    switchModePhoto(on=true) {
        this._layers.region.toggle(!on);
        // this._layers.controls.toggle(!on);
        // this._layers.current.toggle(!on);
        this._layers.controls.toggleButtonDisplay(!on);
        this._layers.controls.toggleLogoActive(!on, false);
    }

    getPlates() {
        return this._layers.plate.getCurrentPlatesData();
    }

    /**
     * Инициализировать графическую составляющую платы
     *
     * @param {HTMLElement} dom_node    DOM-узел, в который будет встроена плата
     * @param {Object}      options     дополнительные опции инициализации
     */
    inject(dom_node, options) {
        if (dom_node === undefined) {
            throw new TypeError("Breadboard::inject(): DOM node is undefined");
        }

        const div_wrap = document.createElement("div");
        dom_node.appendChild(div_wrap);

        this._div_wrap = div_wrap;

        div_wrap.style.width = '100%';
        div_wrap.style.height = '100%';
        div_wrap.style.position = 'relative';
        div_wrap.style.overflow = 'hidden';

        this._dom_node_parent = dom_node;

        /// применить опции
        this._setOptions(options);

        /// базовая кисть
        this._brush = SVG(div_wrap);
        this._brush.node.setAttribute("viewBox", "0 0 " + this._options.layout.WRAP_WIDTH + " " + this._options.layout.WRAP_HEIGHT);
        this._brush.node.style.width = "100%";
        this._brush.node.style.height = "100%";

        this._brush.style({"user-select": "none"});

        this.__grid = new Grid(
            this._options.layout.GRID_ROWS,  this._options.layout.GRID_COLS,
            this._options.layout.GRID_WIDTH, this._options.layout.GRID_HEIGHT,
            this._options.layout.GRID_POS_X, this._options.layout.GRID_POS_Y,
            this._options.layout.GRID_GAP_X, this._options.layout.GRID_GAP_Y,
            this._options.layout.WRAP_WIDTH, this._options.layout.WRAP_HEIGHT,
            this._options.layout.POINTS
        );

        /// создать фильтры
        this._defineFilters();
        /// создать градиенты
        this._defineGradients();
        /// инициализировать слои
        this._composeLayers();
    };


    /**
     * Задать запрет на создание/движение плашек
     *
     * @param {boolean}
     */
    setReadOnly(readOnly) {
        this._options.readOnly = readOnly;
        this._setLayersReadOnly(this._options.readOnly);
        // this.redraw(this._schematic);

        // this._options.showControlsDefault = !readOnly;

        // this.redraw(this._schematic);
        // this._attachControlsEvents();
    }

    setLayout(layout) {
        this.reinject({layout});
    }

    /**
     * Удалить графическую составляющую платы
     */
    dispose() {
        this._brush.node.remove();
        this._layers = {};
    }

    reinject(options) {
        this.dispose();
        this.inject(this._dom_node_parent, this._mergeOptions(options));
    }

    redraw(schematic, detailed, verbose) {
        this._layers.background.recompose(schematic, detailed);
        this._layers.plate.recompose(schematic, verbose);
        this._layers.current.recompose(schematic, detailed);
        this._layers.controls.recompose(schematic);
        this._layers.label.recompose(schematic, detailed);
    }

    /**
     * Добавить плашку
     *
     * @param {string}      type        тип плашки
     * @param {int}         x           позиция плашки по оси X
     * @param {int}         y           позиция плашки по оси Y
     * @param {string}      orientation ориентация плашки
     * @param {null|int}    id          идентификатор плашки
     * @param {*}           extra       резервное поле
     *
     * @returns {null|int} идентификатор плашки
     */
    addPlate(type, x=0, y=0, orientation='west', id=null, extra) {
        return this._layers.plate.addPlate(type, x, y, orientation, id, extra);
    }

    /**
     * Установить состояние плашки
     *
     * @param {int}     plate_id    идентифиактор плашки
     * @param {object}  state       состояние плашки
     */
    setPlateState(plate_id, state) {
        this._layers.plate.setPlateState(plate_id, state);
    }

    /**
     * Подсветить ошибочные плашки
     *
     * @param {Array} plate_ids массив идентификаторов плашек, которые требуется подсветить
     *
     */
    highlightPlates(plate_ids) {
        this._layers.plate.highlightPlates(plate_ids);
    }

    /**
     * Удалить все плашки с платы
     */
    clearPlates() {
        this._layers.plate.removeAllPlates();
    }

    getLayout() {
        return this._options.layout;
    }

    /**
     * Установить плашки на плату
     *
     * @param {Array<Object>} plates список плашек, которые должны отображаться на плате
     */
    setPlates(plates) {
        return this._layers.plate.setPlates(plates);
    }

    /**
     * Отобразить токи на плате
     *
     * @param {Array<Object>} threads контуры токов
     */
    setCurrents(threads) {
        // this._layers.current.setCurrents(threads, this._spare);
        this._layers.current.setCurrents(threads, false, this._options.showSourceCurrents);
    }

    removeAllCurrents() {
        this._layers.current.removeAllCurrents();
    }

    /**
     * Очистить токи
     */
    clearCurrents() {
        this._layers.current.removeAllCurrents();
    }

    /**
     * Подсветить область
     *
     * @param {Object}  from    исходная координата выделения
     * @param {Object}  to      конечная координата выделения
     * @param {boolean} clear   очистить предыдущее выделение
     * @param {String}  color   цвет выделения в формате Hex
     */
    highlightRegion(from, to, clear) {
        this._layers.region.highlightRegion(from, to, clear);
    }

    /**
     * Очистить подсвеченные области
     */
    clearRegions() {
        this._layers.region.clearRegions();
    }

    setPinsValues(values) {
        this._layers.label.setPinsValues(values);
    }

    /**
     * Устаовить обработчик события изменения состояния платы
     *
     * @param {Function} cb обработчик события изменения состояния платы
     */
    onChange(cb) {
        if (!cb) {this._callbacks.change = () => {}}

        this._callbacks.change = cb;
    }

    /**
     * Устаовить обработчик начала перетаскивания плашки
     *
     * @param {Function} cb обработчик начала перетаскивания плашки
     */
    onDragStart(cb) {
        if (!cb) {this._callbacks.dragstart = () => {}}

        this._callbacks.dragstart = cb;
    }

    onShortCircuitStart(cb) {
        if (!cb) {this._callbacks.shortcircuitstart = () => {}}

        this._callbacks.shortcircuitstart = cb;
    }

    onShortCircuitEnd(cb) {
        if (!cb) {this._callbacks.shortcircuitend = () => {}}

        this._callbacks.shortcircuitend = cb;
    }

    switchSchematic(on, detailed) {
        // TODO: Merge detailed and schematic modes
        if (this._schematic === on && this._detailed === detailed) return;

        this._schematic = on;
        this._detailed = detailed;

        this.redraw(this._schematic, this._detailed, this._verbose);
    }

    switchVerbose(on) {
        if (this._verbose === on) return;

        this._verbose = on;

        this.redraw(this._schematic, this._detailed, this._verbose);
    }

    switchSpareFilters(on) {
        this._spare = on;

        return;

        if (!this._filters_defined) {return}

        // Фильтры должны храниться в этом узле
        let defs_elem = this._brush.defs().node;

        let defs = [];

        defs.push({
            id: "glow-current",
            html:
                '<filter id="glow-current" filterUnits="userSpaceOnUse">\
                    <feColorMatrix type="matrix" result="colorCurrent" values=\
                            "1 0 0 0   0\
                             0 1 0 0   0\
                             0 0 1 0   0\
                             0 0 0 1   0"/>\
                    <feColorMatrix type="matrix" result="colorCurrentWhite" values=\
                            "1 1 1 0   0\
                             1 1 1 0   0\
                             1 1 1 0   0\
                             0 0 0 0.2 0"/>\
                    <feGaussianBlur in="colorCurrentWhite" stdDeviation="1" result="coloredBlurIn"/>\
                    <feGaussianBlur id="filter-pulse" in="colorCurrent" stdDeviation="2" result="coloredBlurOut"/>'
                    + '<feMerge>'
                    + (on ? '' : '<feMergeNode in="coloredBlurOut"/>')
                    + '<feMergeNode in="SourceGraphic"/>'
                    + (on ? '' : '<feMergeNode in="coloredBlurIn"/>')

                    + (on ? '<feMergeNode in="colorCurrentWhite"/>' : '')
                    + '</feMerge>\
                </filter>'
                + (on ? '' : '<animate xlink:href="#filter-pulse" attributeName="stdDeviation"\
                values="2;10;2" dur="3s" begin="0s" repeatCount="indefinite"/>')
            }
        );

        defs.push({
            id: "glow-plate",
            html:
            // Свечение плашки
                '<filter id="glow-plate" filterUnits="userSpaceOnUse">\
                    <feColorMatrix type="matrix" result="colorPlateBlue" values=\
                            "0 0 0 0   0\
                             0 1 0 0   0\
                             0 0 1 0   0\
                             0 0 0 0.5 0"/>\
                    <feGaussianBlur stdDeviation="20" in="colorPlateBlue" result="coloredBlur"/>'
                    + '<feMerge>'
                        + (on ? '' : '<feMergeNode in="coloredBlur"/>')
                        + '<feMergeNode in="SourceGraphic"/>'
                        + (on ? '<feMergeNode in="colorPlateBlue"/>' : '')
                    + '</feMerge>\
                </filter>'
            }
        );

        for (let def of defs) {
            let def_node = document.getElementById(def.id);

            if (def_node) {
                def_node.remove();
            }

            defs_elem.insertAdjacentHTML('beforeend', def.html);
        }
    }

    /**
     * Скомпоновать слои платы
     *
     * @private
     */
    _composeLayers() {
        /// создание DOM-контейнеров
        let background  = this._brush.nested(); // фон
        let label_panes = this._brush.nested(); // подписи
        let current     = this._brush.nested(); // токи
        let region      = this._brush.nested(); // области выделения
        let plate       = this._brush.nested(); // плашки
        let controls    = this._brush.nested(); // органы управления
        let selector    = document.createElement("div"); // органы управления

        this._div_wrap.appendChild(selector);

        /// инициализация слоёв
        this._layers.background = new BackgroundLayer(background, this.__grid, this._schematic, this._detailed);
        this._layers.label      = new LabelLayer(label_panes, this.__grid);
        this._layers.current    = new CurrentLayer(current, this.__grid, this._schematic, this._detailed);
        this._layers.plate      = new PlateLayer(plate, this.__grid, this._schematic, this._verbose);
        this._layers.region     = new RegionLayer(region, this.__grid);
        this._layers.controls   = new ControlsLayer(controls, this.__grid);
        this._layers.selector   = new SelectorLayer(selector, this.__grid);

        this._layers.background.setDomainConfig(this._options.layout.DOMAINS);
        this._layers.controls.setLayoutConfig(this._options.layout.CONTROLS);
        this._layers.label.setDomainConfig(this._options.layout.DOMAINS);

        /// внутренняя компоновка каждого слоя
        this._layers.background.compose();
        this._layers.label.compose();
        this._layers.current.compose();
        this._layers.plate.compose();
        this._layers.region.compose();
        this._layers.controls.compose(Breadboard.getAllPlateTypes(), Breadboard.getAllPlateCaptions());
        this._layers.selector.compose();

        /// включение / отключение режима только чтения
        this._setLayersReadOnly(this._options.readOnly);
        this._attachControlsEvents();
        this._attachNotificationEvents();

        /// выполнить нажатие вручную, если требуется показать органы управления при запуске
        //if (this._options.showControlsDefault) {
            //this._layers.background.clickLogo();
        //}
    }

    /**
     * Задать опции платы
     *
     * @param {boolean} readOnly
     */
    _setLayersReadOnly(readOnly) {
        this._layers.plate.setEditable(!readOnly);
        this._layers.controls.toggleLogoActive(!readOnly);
        this._layers.controls.setVisibilityBlocking(readOnly);
        this._layers.controls.setVisibility(!readOnly);

        /// если не режим только чтения, подключить обработчик изменения состояния платы
        if (!readOnly) {
            this._layers.plate.onChange((data) => {this._callbacks.change(data)});
        } else {
            this._layers.plate.onChange();
        }
    }

    /**
     * Задать опции платы
     *
     * @param {Object} options словарь опций
     * @private
     */
    _setOptions(options) {
        options = options || {};

        this._options = {
            layout: (options.layout === undefined ? Breadboard.Layouts.Basic : options.layout),
            readOnly: (options.readOnly === undefined ? true : options.readOnly),
            showControlsDefault: (options.showControlsDefault === undefined ? true : options.showControlsDefault),
            showSourceCurrents: (options.showSourceCurrents === undefined ? true : options.showSourceCurrents)
        }
    }

    _mergeOptions(options) {
        options = options || {};

        for (const [index, option] of Object.entries(this._options)) {
            options[index] = (options[index] === undefined) ? this._options[index] : options[index];
        }

        return options;
    }

    /**
     * Подключить обработчики событий органов управления платой
     *
     * @private
     */
    _attachControlsEvents() {
        /// очистка платы
        this._layers.selector.onClear(() => {
            this.clearPlates();

            this._callbacks.change({
                id: null,
                action: 'clear'
            });
        });

        this._layers.controls.onMenuClick(() => {
            this._layers.selector.open();
        })

        this._layers.selector.onPlateTake((plate_data, plate_x, plate_y, cursor_x, cursor_y) => {
            this._layers.plate.takePlate(plate_data, plate_x, plate_y, cursor_x, cursor_y);
        })

        /// переключение полноэкранного режима
        this._layers.selector.onFullscreen((on) => {
            Breadboard.fullScreen(on, this._brush.node);
        });

        /// нажатие на пункт глобального контекстного меню (платы)
        this._layers.controls.onContextMenuItemClick((alias, value) => {
            switch (alias) {
                case BoardContextMenu.CMI_SNAPSH_SVG:
                    this._saveToImage();
                    break;
                case BoardContextMenu.CMI_SNAPSH_PNG:
                    this._saveToImage(true);
                    break;
                case BoardContextMenu.CMI_IMPORT:
                    this._importPlates(value);
                    break;
                case BoardContextMenu.CMI_EXPORT:
                    this._exportPlates();
                    break;
                case BoardContextMenu.CMI_MOD_PHOTO:
                    this.switchSchematic(false);
                    break;
                case BoardContextMenu.CMI_MOD_SCHEMA:
                    this.switchSchematic(true, false);
                    break;
                case BoardContextMenu.CMI_MOD_DETAIL:
                    this.switchSchematic(true, true);
                    break;
                case BoardContextMenu.CMI_MOD_VERBOS_INP:
                    this.switchVerbose(value);
                    break;
                case BoardContextMenu.CMI_LAY_BASIC:
                    this.setLayout(Breadboard.Layouts.Basic);
                    break;
                case BoardContextMenu.CMI_LAY_ADVAN:
                    this.setLayout(Breadboard.Layouts.Advanced);
                    break;
            }
        });

        /// начало перетаскивания плашки
        this._layers.plate.onDragStart(() => {
            this._callbacks.dragstart();
        })
    }

    _attachNotificationEvents() {
        this._layers.current.onShortCircuitStart(() => {
            this._callbacks.shortcircuitstart();
        })

        this._layers.current.onShortCircuitEnd(() => {
            this._callbacks.shortcircuitend();
        })
    }

    /**
     * Импортировать плашки из файла
     *
     * @param {File} file файл, содержащий JSON-объект с информацией о состоянии платы
     * @private
     */
    _importPlates(file) {
        let reader = new FileReader();

        reader.readAsText(file, "UTF-8");

        reader.onload = (evt) => {
            let plates = JSON.parse(evt.target.result);

            this.clearPlates();

            for (let plate of plates) {
                this.addPlate(plate.type, plate.x, plate.y, plate.orientation, plate.id, plate.extra);

                this.setPlateState(plate.id, {
                    adc: plate.adc,
                    // currents: plate.currents,
                    // volatges: plate.volatges,
                })
            }

            if (plates.length > 0) {
                this._callbacks.change({
                    id: null,
                    action: 'imported'
                });
            }
        };
    }

    /**
     * Экспортировать текущее состояние платы в файл
     *
     * @private
     */
    _exportPlates() {
        let plates_str = JSON.stringify(this.getPlates());

        let file = new Blob([plates_str], {type: "text/plain;charset=utf-8"});

        if (window.navigator.msSaveOrOpenBlob) {
            // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else {
            // Others
            let a = document.createElement("a");
            let url = URL.createObjectURL(file);

            a.href = url;
            a.download = "bbconfig.json";

            document.body.appendChild(a);

            a.click();

            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    _saveToImage(rasterize=false) {
        let svg_node = this.getContainer();

        if (!svg_node) {return}

        let canvas = document.createElement("canvas");
        canvas.style.minWidth = this._options.layout.WRAP_WIDTH;
        canvas.style.minHeight = this._options.layout.WRAP_HEIGHT;

        canvas.setAttribute('width', this._options.layout.WRAP_WIDTH);
        canvas.setAttribute('height', this._options.layout.WRAP_HEIGHT);

        document.body.appendChild(canvas);

        this.switchModePhoto(true);
        let svgString = new XMLSerializer().serializeToString(svg_node);
        this.switchModePhoto(false);

        let svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});

        if (rasterize) {
            canvg(canvas, svgString, {ignoreDimensions: false, scaleHeight: this._options.layout.WRAP_HEIGHT});

            let img = canvas.toDataURL("image/png");

            saveAs(img, 'breadboard.png');
        } else {
            saveAs(svg, 'breadboard.svg');
        }

        canvas.remove();
    }

    /**
     * Задать SVG-фильтры
     *
     * @private
     */
    _defineFilters() {
        return;

        let defs = [];

        // Тень вовнутрь
        defs.push(
            '<filter id="inner-shadow">\
                <feOffset dx="0" dy="0" />\
                <feGaussianBlur stdDeviation="8" result="offset-blur"/>\
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />\
                <feFlood flood-color="6B2C22" flood-opacity=".3" result="color" />\
                <!-- Clip color inside shadow -->\
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />\
                <!-- Put shadow over original object -->\
                <feComposite operator="over" in="shadow" in2="SourceGraphic">\
            </filter>'
        );

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

        // Фильтры должны храниться в этом узле
        let defs_elem = this._brush.defs().node;

        for (let def of defs) {
            defs_elem.insertAdjacentHTML('beforeend', def);
        }

        this._filters_defined = true;

        this.switchSpareFilters(this._spare);
    };

    _defineGradients() {
        initGradients(this._brush.group("gradients"));
    }

    /**
     * Возвратить список всех типов плашек
     *
     * @returns {Array<string>}
     */
    static getAllPlateTypes() {
        return PlateLayer._getAllPlateTypes();
    }

    /**
     * Возвратить список всех названий типов плашек
     *
     * @returns {Array<string>}
     */
    static getAllPlateCaptions() {
        return PlateLayer._getAllPlateCaptions();
    }

    /**
     * Переключить полноэкранный режим отображения DOM-элемента
     *
     * @param {boolean}     on      включить полноэкранный режим?
     * @param {HTMLElement} element DOM-элемент
     */
    static fullScreen(on, element) {
        if (on) {
            if (element.requestFullScreen) {
                element.requestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }

    /**
     * Получить положение курсора в системе координат SVG
     *
     * @param {HTMLElement} svg_main    SVG-узел, в системе координат которого нужна точка
     * @param {number}      clientX     Положение курсора по оси X
     * @param {number}      clientY     Положение курсора по оси Y
     *
     * @returns {SVGPoint}  точка, координаты которой определяют положение курсора
     *                      в системе координат заданного SVG-узла
     */
    static getCursorPoint(svg_main, clientX, clientY) {
        let svg_point = svg_main.createSVGPoint();

        svg_point.x = clientX;
        svg_point.y = clientY;

        return svg_point.matrixTransform(svg_main.getScreenCTM().inverse());
    }
}
