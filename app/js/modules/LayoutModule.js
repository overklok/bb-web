import Module from "../core/Module";

import layout   from "../../vendor/js/jquery.layout.js";
require("jquery-ui-bundle");

import styles from "../../css/layout.css";

/// jQuery Layout conflict fix
(function ($){$.fn.selector = { split: function() { return ""; }};})(jQuery);

/**
 * DOM-идентификаторы панелей
 *
 * @const
 * @type {object}
 */
const PANE_IDS = {
    MAIN_CENTER:    "main-center",
    MAIN_EAST:      "main-east",

    EAST_NORTH:         "east-north",
    EAST_CENTER_CENTER: "east-center-center",
    EAST_CENTER_SOUTH:  "east-center-south",

    EAST_SOUTH:     "east-south"
};


/**
 * Режимы разметки
 *
 * @const
 * @type {object}
 */
const MODES = {
    FULL:   "full",
    SIMPLE: "simple"
};


/**
 * Отображения "назначение панели" -> "ID DOM-узла" для режимов разметки
 *
 * @const
 * @type {object}
 */
const MAPPINGS = {
    full: {
        workspace: PANE_IDS.MAIN_CENTER,
        breadboard: PANE_IDS.EAST_SOUTH,
        tracing: PANE_IDS.EAST_CENTER_CENTER,
        buttons: PANE_IDS.EAST_CENTER_SOUTH
    },
    simple: {
        breadboard: PANE_IDS.MAIN_CENTER
    }
};

/**
 * Элементы режимов разметки, которые должны быть проигнорированы
 * при анимации перехода между режимами
 *
 * @const
 * @type {{full: *[string], simple: *[string]}}
 */
const FADEBLOCKINGS = {
    full: [
        PANE_IDS.MAIN_EAST,
        PANE_IDS.EAST_NORTH,
        PANE_IDS.EAST_CENTER_SOUTH,
    ],
    simple: [
        PANE_IDS.MAIN_EAST,
        PANE_IDS.EAST_NORTH,
        PANE_IDS.EAST_CENTER_SOUTH,
    ]
};

/**
 * Начальная задержка
 *
 * Используется для устранения вероятных коллизий
 * при частой смене режимов разметки
 *
 * @const
 * @type {number}
 */
const DURATION_INITIAL = 100;

/**
 * Модуль автоматической разметки страницы
 *
 * Автоматически распределяет зоны среды
 * и задаёт параметры их отображения
 *
 * @class
 * @classdesc APPROVED, STRESS-TESTED, NEEDS MORE TESTS
 */
class LayoutModule extends Module {
    static get eventspace_name() {return "lay"}
    static get event_types() {return ["compose-begin", "compose-end", "resize"]}

    static defaults() {
        return {
            animSpeedMain: 500,     // скорость анимации главных элементов
            animSpeedSub: 100,      // скорость анимации мелких элементов
            animSpeedFade: 200,     // скорость анимации перехода
            delayBeforeEnd: 100     // задержка для прогрузки внутренностей
        }
    }

    /**
     * @constructor
     * @param options Настройки модуля
     */
    constructor(options) {
        super(options);

        this._state = {
            mode: MODES.FULL,
            transition_active: false,
            transition_dummy: false,
            buttons_pane_visible: true,
        };

        this._callbacks = {
            on_transition_end: function() {}
        };

        this._layout_options = this._getFullLayout();

        this._layout = $('body').layout(this._layout_options);

        this._panes = this._getPanes();

        if (!this._options.animSpeedFade) {
            this._options.delayBeforeEnd = 0;
        }
    }

    /**
     * Скомпоновать разметку страницы
     *
     * @param mode {string} режим компоновки
     */
    compose(mode) {
        if (!(mode in MAPPINGS)) {
            throw new RangeError("There are no layout mode named `" + mode + "` in mappings");
        }

        return new Promise(resolve => {
            let nodes = this._transformMappingToNodes(MAPPINGS[mode]);

            let duration = DURATION_INITIAL;

            if (this._state.mode === mode) {
                setTimeout(() => {
                    resolve();
                    this.emitEvent("compose-end", nodes);
                }, duration);

                return;
            }

            if (this._options.animSpeedFade) {
                duration += this._options.animSpeedFade;
                this._hidePanes(this._state.mode, this._options.animSpeedFade);
            }

            setTimeout(() => {
                this.emitEvent("compose-begin", nodes);
            }, duration);

            switch (mode) {
                case MODES.SIMPLE: {
                    this._panes.east.hide("north");
                    duration += this._options.animSpeedSub;

                    this._panes.east.hide("south");
                    duration += this._options.animSpeedSub;

                    this._layout.sizePane("east", .4);
                    duration += this._options.animSpeedMain;

                    if (this._state.buttons_pane_visible) {
                        this._panes._east.center.hide("south");
                        duration += this._options.animSpeedSub;
                    }

                    break;
                }
                case MODES.FULL: {
                    this._panes.east.show("north");
                    duration += this._options.animSpeedSub;

                    this._panes.east.show("south");
                    duration += this._options.animSpeedSub;

                    this._layout.sizePane("east", .3);
                    duration += this._options.animSpeedMain;

                    if (this._state.buttons_pane_visible) {
                        this._panes._east.center.show("south");
                        duration += this._options.animSpeedSub;
                    }

                    break;
                }
                default: {
                    throw new TypeError("Mode " + mode + "is not supported");
                }
            }

            this._state.mode = mode;

            /// задержка для анимации смены разметки
            setTimeout(() => {
                this.emitEvent("compose-end", nodes);
                /// задержка для прогрузки внутренностей
                setTimeout(() => {
                    if (this._options.animSpeedFade) {
                        this._showPanes(this._options.animSpeedFade);
                    }
                    /// задержка для анимации появления
                    setTimeout(() => {
                        resolve();
                    }, this._options.animSpeedFade) // задержка для анимации появления
                }, this._options.delayBeforeEnd) // задержка для прогрузки внутренностей
            }, duration); // задержка для анимации смены разметки
        });
    }

    /**
     * Переключить панель, отображающую нажатые кнопки
     *
     * @param on
     * @returns {Promise<any>}
     */
    switchButtonsPane(on) {
        return new Promise(resolve => {
            if (on === this._state.buttons_pane_visible || this._state.mode === MODES.SIMPLE) {
                resolve();
                return;
            }

            let duration = DURATION_INITIAL;

            if (on) {
                this._state.buttons_pane_visible = true;

                this._panes._east.center.show("south");
                duration += this._options.animSpeedSub;
            } else {
                this._state.buttons_pane_visible = false;

                this._panes._east.center.hide("south");
                duration += this._options.animSpeedSub;
            }

            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    /**
     * Скрыть панели
     *
     * Вызывается при смене режимов разметки
     *
     * @param {string} mode     режим разметки, из которого необходимо выйти
     * @param {number} speed    время анимации сокрытия в миллисекундах
     * @private
     */
    _hidePanes(mode, speed) {
        for (let pane_id of Object.values(PANE_IDS)) {
            if (FADEBLOCKINGS[mode].indexOf(pane_id) >= 0) {
                continue;
            }

            if (Object.values(MAPPINGS[mode]).indexOf(pane_id) >= 0) {
                $("#" + pane_id).animate({opacity: 0}, speed)
            } else {
                $("#" + pane_id).animate({opacity: 0}, 0)
            }
        }
    }

    /**
     * Показать панели
     *
     * Вызывается при смене режимов разметки
     *
     * @param {number} speed время анимации сокрытия в миллисекундах
     * @private
     */
    _showPanes(speed) {
        for (let pane_id of Object.values(PANE_IDS)) {
            $("#" + pane_id).animate({opacity: 1}, speed)
        }
    }


    /**
     * Преобразовать соответствия "ID области" -> "ID DOM-узла области"
     * в соответствия "ID области" -> "DOM-узел области"
     *
     * @param map {Object}  Соответствия "ID области" -> "ID DOM-узла области"
     * @returns {Object}    Соответствия "ID области" -> "DOM-узел области"
     * @private
     */
    _transformMappingToNodes(map) {
        let nodes = {};

        for ([k, node_id] of Object.entries(map)) {
            nodes[k] = document.getElementById(node_id);
        }

        return nodes;
    }

    /**
     * Обработать событие "изменение размера"
     *
     * @private
     */
    _onResize() {
        this.emitEvent("resize");
    }

    /**
     * Получить полную разметку
     *
     * Метод используется для сокрытия большого объекта из конструктора
     *
     * @returns {object}
     * @private
     */
    _getFullLayout() {
        return {
            closable: true,	    // pane can open & close
            resizable: true,	// when open, pane can be resized
            slidable: true,	    // when closed, pane can 'slide' open over other panes - closes on mouse-out
            livePaneResizing: true,
            fxSpeed: this._options.animSpeedMain,
            animatePaneSizing: true,
            onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},

            //	some resizing/toggling settings
            north: {
                slidable: false,	            // OVERRIDE the pane-default of 'slidable=true'
                closable: false,
                spacing_closed: 20,		        // big resizer-bar when open (zero height)
                size: .1,
                maxSize: 100
            },

            center: {},

            //	some pane-size settings
            east: {
                size: .3,
                fxSpeed: this._options.animSpeedMain,
                onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                childOptions: {
                    north: {
                        size: .3,
                        fxSpeed: this._options.animSpeedSub,
                        onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                    },
                    south: {
                        size: .4,
                        fxSpeed: this._options.animSpeedSub,
                        onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                    },
                    center: {
                        childOptions: {
                            south: {
                              size: .2,
                                slidable: false,
                                closable: false,
                                onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                            }
                        }
                    }
                }
            },
        };
    }

    /**
     * Получить ссылки на панели jQuery UI Layouts
     *
     * Метод используется упрощённого доступа к элементам разметки
     *
     * @returns {object}
     * @private
     */
    _getPanes() {
        console.log(this._layout);

        return {
            north: this._layout.north,
            center: this._layout.center,
            east: this._layout.east.children.layout1,

            _east: {
                north:  this._layout.east.children.layout1.north,
                south:  this._layout.east.children.layout1.south,
                center: this._layout.east.children.layout1.center.children.layout1,

                _center: {
                    center: this._layout.east.children.layout1.center.children.layout1.center,
                    south:  this._layout.east.children.layout1.center.children.layout1.south,
                }
            }
        }
    }

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default LayoutModule;