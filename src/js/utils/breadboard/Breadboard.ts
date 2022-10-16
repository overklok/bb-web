import SVG from 'svg.js'
import canvg from 'canvg';
import { saveAs } from 'file-saver';
import cloneDeep from "lodash/cloneDeep";
import defaultsDeep from "lodash/defaultsDeep";

import Grid from "./core/Grid";
import MenuLayer from "./layers/MenuLayer";
import LabelLayer from "./layers/LabelLayer";
import PlateLayer, { PlatePrototype } from "./layers/PlateLayer";
import PopupLayer from './layers/PopupLayer';
import RegionLayer from "./layers/RegionLayer";
import VoltageLayer from './layers/VoltageLayer';
import CurrentLayer from "./layers/CurrentLayer";
import ControlsLayer from "./layers/ControlsLayer";
import SelectorLayer from "./layers/SelectorLayer";
import BackgroundLayer from "./layers/BackgroundLayer";
import BoardContextMenu from "./menus/BoardContextMenu";

import { initGradients } from "./styles/gradients";
import { LAYOUTS as DEFAULT_LAYOUTS } from "./core/extras/layouts";
import { Layout } from "./core/types";
import { Thread } from './core/Current';
import { SerializedPlate, SerializedPlatePosition } from './core/Plate';


require("./styles/main.css");

/**
 * 
 * @category Breadboard
 */
type BreadboardOptions = {
    layouts?: {[layout_name: string]: Layout},
    layout_name?: string,
    debug?: boolean,
    verbose?: boolean,
    detailed?: boolean,
    schematic?: boolean,
    readOnly? : boolean,
    bgVisible?: boolean,
    showControlsDefault?: boolean,
    showSourceCurrents?: boolean
}

/**
 * Основной класс платы.
 * Предоставляет API управления визуализацией платы внешним модулям приложений
 *
 * @category Breadboard
 */
export default class Breadboard {
    private _options: BreadboardOptions;
    private _brush: SVG.Doc;
    private __grid: Grid;
    private _layers: {
        background?: BackgroundLayer,
        label?:      LabelLayer,
        current?:    CurrentLayer,
        plate?:      PlateLayer,
        region?:     RegionLayer,
        controls?:   ControlsLayer,
        selector?:   SelectorLayer,
        menu?:       MenuLayer,
        popup?:      PopupLayer,
        domain?:     VoltageLayer
    }

    private _callbacks: {
        change: CallableFunction,
        dragstart: CallableFunction,
        shortcircuitstart: CallableFunction,
        shortcircuitend: CallableFunction,
        layoutchange: CallableFunction
    }

    private readonly _layouts: {[key: string]: Layout};
    private _div_wrap: HTMLDivElement;
    private _layout: Layout;
    private _cache: { current: any; };
    private _dom_node_parent: any;
    private _spare: boolean;
    private _filters_defined: boolean;
    private _injected: boolean;

    constructor(options: BreadboardOptions) {
        if (!SVG.supported) {
            alert("SVG is not supported. Please use any modern browser.");
        }

        this._brush = undefined;
        this.__grid = undefined;

        this._layers = {
            background: undefined,
            label:      undefined,
            plate:      undefined,
            current:    undefined,
            region:     undefined,
            controls:   undefined,
            selector:   undefined,
            menu:       undefined,
            popup:      undefined
        };

        this._callbacks = {
            change: () => {},
            dragstart: () => {},
            shortcircuitstart: () => {},
            shortcircuitend: () => {},
            layoutchange: () => {},
        };

        this._layouts = {};
        this.registerLayouts(DEFAULT_LAYOUTS);

        this._cache = {
            current: undefined,
        };

        this._dom_node_parent = undefined;

        this._spare = false;
        this._filters_defined = false;

        this._setOptions(options)

        this._injected = false;
    }

    /* TODO: Define 'properties' type */
    static drawPlate(parent: HTMLElement, type: string, properties: unknown) {
        const grid = new Grid({
            dim:  { x: 10, y: 10 }, 
            size: { x: 1000, y: 700 },
            gap:  { x: 10, y: 10 },
            pos:  { x: 0, y: 0 },
            wrap: { x: 1000, y: 700 },
        });
        const div_wrap = SVG(parent);

        const plate_type: any = PlateLayer.typeToPlateClass(type);

        const plate = new plate_type(div_wrap, grid, false, false, null, properties);

        plate.draw(grid.cell(0, 0), 'west');
        plate.move_to_point(0, 0);

        const width = plate._container.width() / 2,
              height = plate._container.width() / 2;

        plate._container.center(width / 2, height / 2);

        div_wrap.viewbox(0, 0, width, height);
    }

    getElecLayout() {
        if (!this._layout) throw Error("No layout specified yet");

        return this.__grid.getElecLayout();
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
    }

    getPlates() {
        return this._layers.plate.getSerializedPlates();
    }

    /**
     * Инициализировать графическую составляющую платы
     *
     * TODO: Remove Options (used in constructor)
     *
     * @param {HTMLElement} dom_node    DOM-узел, в который будет встроена плата
     * @param {Object}      options     дополнительные опции инициализации
     */
    inject(dom_node: HTMLElement, options: BreadboardOptions) {
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

        this._injected = true;

        this._dom_node_parent = dom_node;

        /// применить опции
        this._setOptions(options);

        /// установить разметку
        this._layout = this._layouts[this._options.layout_name];

        /// базовая кисть
        this._brush = SVG(div_wrap);
        this._brush.node.setAttribute("viewBox", "0 0 " + this._layout.wrap.x + " " + this._layout.wrap.y);
        this._brush.node.style.width = "100%";
        this._brush.node.style.height = "100%";

        this._brush.style({"user-select": "none"});

        this.__grid = new Grid(this._layout);

        /// создать фильтры
        this._defineFilters();
        /// создать градиенты
        this._defineGradients();
        /// инициализировать слои
        this._composeLayers();

        this.setReadOnly(this._options.readOnly);
    };

    setRandomPlates(protos: PlatePrototype[], size_mid: number, size_deviation: number, attempts_max: number) {
        if (!this._layers.plate) throw new Error("Breadboard must be injected first");
        this._layers.plate.setRandom(protos, size_mid, size_deviation, attempts_max);
    }

    /**
     * Задать запрет на создание/движение плашек
     *
     * @param readOnly {boolean}
     */
    setReadOnly(readOnly: boolean) {
        this._options.readOnly = readOnly;
        this._setLayersReadOnly(this._options.readOnly);
        // this.redraw(this._options.schematic);

        // this._options.showControlsDefault = !readOnly;

        // this.redraw(this._options.schematic);
        // this._attachControlsEvents();
    }

    registerLayouts(layouts: {[layout_name: string]: Layout}) {
        if (!layouts) return;

        for (const [name, layout] of Object.entries(layouts)) {
            this._layouts[name] = layout;

            if (this._layers.controls) {
                this._layers.controls.addContextMenuItem(`layout-${name}`, `Разметка: ${name}`);
            }
        }
    }

    setLayout(layout_name: string) {
        this.reinject({layout_name});
        this._callbacks.layoutchange(layout_name);
        this._callbacks.change({
            id: null,
            action: 'clear'
        });
    }

    /**
     * Удалить графическую составляющую платы
     */
    dispose() {
        if (!this._injected) return;

        this._injected = false;

        this._div_wrap.remove();
        this._brush.node.remove();
        this._layers = {};
    }

    reinject(options: BreadboardOptions) {
        this.dispose();
        this.inject(this._dom_node_parent, this._mergeOptions(options));
    }

    redraw(schematic: boolean, detailed: boolean, verbose: boolean, debug: boolean) {
        this._layers.background.recompose(schematic, detailed, debug);
        this._layers.plate.recompose(schematic, verbose, debug);
        this._layers.current.recompose(schematic, detailed, debug);
        this._layers.controls.recompose(schematic, detailed, debug);
        this._layers.label.recompose(schematic, detailed, debug);
    }

    /**
     * Добавить плашку
     *
     * @param {string}      type        тип плашки
     * @param {int}         position    положение плашки
     * @param {null|int}    id          идентификатор плашки
     * @param {*}           properties       свойства плашки
     *
     * @returns {null|int} идентификатор плашки
     */
    addPlate(type: string, position: SerializedPlatePosition, id: number=null, properties: {}) {
        return this._layers.plate.addPlateSerialized(type, position, id, properties);
    }

    /**
     * Установить состояние плашки
     *
     * @param {int}     plate_id    идентификатор плашки
     * @param {object}  state       состояние плашки
     */
    setPlateState(plate_id: number, state: {}) {
        this._layers.plate.setPlateState(plate_id, state);
    }

    /**
     * Подсветить ошибочные плашки
     *
     * @param {Array} plate_ids массив идентификаторов плашек, которые требуется подсветить
     *
     */
    highlightPlates(plate_ids: number[]) {
        this._layers.plate.highlightPlates(plate_ids);
    }

    /**
     * Удалить все плашки с платы
     */
    clearPlates() {
        this._layers.plate.removeAllPlates();
    }

    getLayoutName() {
        return this._options.layout_name;
    }

    /**
     * Установить плашки на плату
     *
     * @param {Array<Object>} plates список плашек, которые должны отображаться на плате
     */
    setPlates(plates: SerializedPlate[]) {
        return this._layers.plate.setPlates(plates);
    }

    /**
     * Отобразить токи на плате
     *
     * @param {Array<Object>} threads контуры токов
     */
    setCurrents(threads: Thread[], voltages: {[line_id: number]: number}) {
        // this._layers.current.setCurrents(threads, this._spare);
        this._layers.current.setCurrents(threads, false, this._options.showSourceCurrents);
        this.__grid.setLineVoltages(voltages);
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
     */
    highlightRegion(from: {x: number, y: number}, to: {x: number, y: number}, clear: boolean) {
        this._layers.region.highlightRegion(from, to, clear);
    }

    /**
     * Очистить подсвеченные области
     */
    clearRegions() {
        this._layers.region.clearRegions();
    }

    setPinsValues(values: ['input'|'output', number][]) {
        this._layers.label.setPinsValues(values);
    }

    /**
     * Устаовить обработчик события изменения состояния платы
     *
     * @param {Function} cb обработчик события изменения состояния платы
     */
    onChange(cb: Function) {
        if (!cb) {this._callbacks.change = () => {}}

        this._callbacks.change = cb;
    }

    /**
     * Устаовить обработчик начала перетаскивания плашки
     *
     * @param {Function} cb обработчик начала перетаскивания плашки
     */
    onDragStart(cb: Function) {
        if (!cb) {this._callbacks.dragstart = () => {}}

        this._callbacks.dragstart = cb;
    }

    onShortCircuitStart(cb: Function) {
        if (!cb) {this._callbacks.shortcircuitstart = () => {}}

        this._callbacks.shortcircuitstart = cb;
    }

    onShortCircuitEnd(cb: Function) {
        if (!cb) {this._callbacks.shortcircuitend = () => {}}

        this._callbacks.shortcircuitend = cb;
    }

    onLayoutChange(cb: Function) {
        if (!cb) {this._callbacks.layoutchange = () => {}}

        this._callbacks.layoutchange = cb;
    }

    switchSchematic(on: boolean, detailed=false) {
        // TODO: Merge detailed and schematic modes
        if (this._options.schematic === on && this._options.detailed === detailed) return;

        this._options.schematic = on;
        this._options.detailed = detailed;

        this.redraw(this._options.schematic, this._options.detailed, this._options.verbose, this._options.debug);
    }

    switchVerbose(on: boolean) {
        if (this._options.verbose === on) return;

        this._options.verbose = on;

        this.redraw(this._options.schematic, this._options.detailed, this._options.verbose, this._options.debug);
    }

    switchDebug(on: boolean) {
        if (this._options.debug === on) return;

        this._options.debug = on;

        this.redraw(this._options.schematic, this._options.detailed, this._options.verbose, this._options.debug);
    }

    switchSpareFilters(on: boolean) {
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
        let domain      = this._brush.nested(); // области доменов
        let plate       = this._brush.nested(); // плашки
        let controls    = this._brush.nested(); // органы управления
        let selector    = document.createElement("div"); // боковое меню (селектор плашек)
        let menu        = document.createElement("div"); // всплывающее меню
        let popup       = document.createElement("div")  // всплывающие подсказки

        this._div_wrap.appendChild(selector);
        this._div_wrap.appendChild(menu);
        this._div_wrap.appendChild(popup);

        /// инициализация слоёв
        this._layers.background = new BackgroundLayer(background, this.__grid, this._options.schematic, this._options.detailed, this._options.debug);
        this._layers.label      = new LabelLayer(label_panes, this.__grid, this._options.schematic, this._options.detailed);
        this._layers.current    = new CurrentLayer(current, this.__grid, this._options.schematic, this._options.detailed);
        this._layers.plate      = new PlateLayer(plate, this.__grid, this._options.schematic, false, this._options.verbose);
        this._layers.region     = new RegionLayer(region, this.__grid);
        this._layers.controls   = new ControlsLayer(controls, this.__grid);
        this._layers.selector   = new SelectorLayer(selector, this.__grid);
        this._layers.menu       = new MenuLayer(menu, this.__grid);
        this._layers.popup      = new PopupLayer(popup, this.__grid);
        this._layers.domain     = new VoltageLayer(domain, this.__grid);

        this._layers.background.setDomainConfig(this._layout.domains);
        this._layers.background.setBgVisible(this._options.bgVisible);
        this._layers.label.setLayoutConfig(this._layout);
        this._layers.label.setLabelStyle(this._layout.label_style);
        this._layers.plate.setPlateStyle(this._layout.plate_style);

        /// internal composition of each layer
        for (const layer of Object.values(this._layers)) {
            // TODO: Merge context menu calls to popup calls

            // connect context menu request handlers to each layer
            layer.onContextMenuCall(this._layers.menu.openMenu.bind(this._layers.menu));
            layer.onContextMenuClose(this._layers.menu.hideMenu.bind(this._layers.menu));

            // connect popup request handlers to each layer
            layer.onPopupDraw(this._layers.popup.drawPopup.bind(this._layers.popup));
            layer.onPopupShow(this._layers.popup.showPopup.bind(this._layers.popup));
            layer.onPopupHide(this._layers.popup.hidePopup.bind(this._layers.popup));
            layer.onPopupClear(this._layers.popup.clearPopup.bind(this._layers.popup));

            layer.compose();
        }

        /// включение / отключение режима только чтения
        this._setLayersReadOnly(this._options.readOnly);
        this._attachControlsEvents();
        this._attachNotificationEvents();
    }

    /**
     * Задать опции платы
     *
     * @param {boolean} readOnly
     */
    _setLayersReadOnly(readOnly: boolean) {
        this._layers.plate.setEditable(!readOnly);
        this._layers.controls.setVisibility(!readOnly);

        /// если не режим только чтения, подключить обработчик изменения состояния платы
        if (!readOnly) {
            this._layers.plate.onChange((data: {}) => {this._callbacks.change(data)});
        } else {
            this._layers.plate.onChange(null);
        }
    }

    /**
     * Задать опции платы
     *
     * @param {Object} options словарь опций
     * @private
     */
    _setOptions(options: BreadboardOptions) {
        options = options || {};

        if (options.layouts) {
            this.registerLayouts(options.layouts);
        }

        if (options.layout_name) {
            if (!this._layouts[options.layout_name]) throw new RangeError(`Layout ${options.layout_name} does not exist`);
        }

        this._options = {
            debug:      options.debug || false,
            verbose:    options.verbose || false,
            detailed:   options.detailed || false,
            schematic:  options.schematic || false,

            bgVisible:              (options.bgVisible === undefined ? true : options.bgVisible),
            readOnly:               (options.readOnly === undefined ? true : options.readOnly),
            layout_name:            (options.layout_name === undefined ? 'default' : options.layout_name),
            showControlsDefault:    (options.showControlsDefault === undefined ? true : options.showControlsDefault),
            showSourceCurrents:     (options.showSourceCurrents === undefined ? true : options.showSourceCurrents)
        }
    }

    _mergeOptions(options: {[key: string]: any}) {
        options = options || {};

        options = defaultsDeep(cloneDeep(options), this._options);

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

        this._layers.selector.onPlateTake((
            plate_data: SerializedPlate,
            plate_x: number,
            plate_y: number,
            cursor_x: number,
            cursor_y: number
        ) => {
            this._layers.plate.takePlate(plate_data, plate_x, plate_y, cursor_x, cursor_y);
        })

        /// переключение полноэкранного режима
        this._layers.selector.onFullscreen((on: boolean) => {
            Breadboard.fullScreen(on, this._brush.node);
        });

        /// нажатие на пункт глобального контекстного меню (платы)
        this._layers.menu.onContextMenuItemClick((item_id: number, alias: string, value: any) => {
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
                case BoardContextMenu.CMI_SELECTOR:
                    this._layers.selector.togglePin();
                    break;
            }

            if (item_id != null) {
                this._layers.plate.handlePlateContextMenuItemClick(item_id, alias, value);
            }

            for (const layout_alias of Object.keys(this._layouts)) {
                if (alias === `layout-${layout_alias}`) {
                    this.setLayout(layout_alias);
                }
            }
        });

        /// переопределить пункты меню, определяющие разметку
        for (const [alias, layout] of Object.entries(this._layouts)) {
            this._layers.controls.addContextMenuItem(`layout-${alias}`, `Разметка: ${alias}`);
        }

        /// начало перетаскивания плашки
        this._layers.plate.onDragStart(() => {
            this._callbacks.dragstart();
        });
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
    _importPlates(file: File) {
        let reader = new FileReader();

        reader.readAsText(file, "UTF-8");

        reader.onload = (evt: ProgressEvent) => {
            /* TODO */
            let plates = JSON.parse((evt.target as any).result);

            this.clearPlates();

            for (let plate of plates) {
                this.addPlate(plate.type, plate.position, plate.id, plate.properties);

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

        // @ts-ignore
        if (window.navigator.msSaveOrOpenBlob) {
            // IE10+
            // @ts-ignore
            window.navigator.msSaveOrOpenBlob(file, "bbconfig.json");
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
        canvas.style.minWidth = String(this._layout.wrap.x);
        canvas.style.minHeight = String(this._layout.wrap.y);

        canvas.setAttribute('width', String(this._layout.wrap.x));
        canvas.setAttribute('height', String(this._layout.wrap.y));

        document.body.appendChild(canvas);

        this.switchModePhoto(true);
        let svgString = new XMLSerializer().serializeToString(svg_node);
        this.switchModePhoto(false);

        let svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});

        if (rasterize) {
            canvg(canvas, svgString, {ignoreDimensions: false, scaleHeight: this._layout.wrap.y});

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
        initGradients(this._brush.group());
    }

    /**
     * Переключить полноэкранный режим отображения DOM-элемента
     *
     * @param {boolean}     on      включить полноэкранный режим?
     * @param {HTMLElement} element DOM-элемент
     */
    static fullScreen(on: boolean, element: any) {
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
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).webkitCancelFullScreen) {
                (document as any).webkitCancelFullScreen();
            }
        }
    }
}
