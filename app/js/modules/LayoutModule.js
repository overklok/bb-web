import Module from "../core/Module";

require("jquery-ui/ui/widgets/resizable");
require("jquery-ui-bundle");
import layout   from "../../vendor/js/jquery.layout.js";

// console.log("JQR", jQuery.easing);

import styles from "../../css/layout.css";

/// jQuery Layout conflict fix
(function ($){$.fn.selector = { split: function() { return ""; }};})(jQuery);

const ROOT_CLASS = "ui-layout-container";

/**
 * DOM-идентификаторы панелей
 *
 * @const
 * @type {object}
 */
const PANE_IDS = {
    MAIN_NORTH:     "main-north",
    MAIN_CENTER:    "main-center",
    MAIN_EAST:      "main-east",

    // EAST_NORTH:         "east-north",
    EAST_CENTER:    "east-center",

    EAST_SOUTH_CENTER: "east-south-center",
    EAST_SOUTH_SOUTH:  "east-south-south",

    EAST_SOUTH:     "east-south",
};


/**
 * Режимы разметки
 *
 * @const
 * @type {object}
 */
const MODES = {
    FULL:   "full",
    SIMPLE: "simple",
    HOME: "home",
};


/**
 * Отображения "назначение панели" -> "ID DOM-узла" для режимов разметки
 *
 * @const
 * @type {object}
 */
const MAPPINGS = {
    full: {
        launch_buttons: PANE_IDS.MAIN_CENTER,
        workspace: PANE_IDS.MAIN_CENTER,
        // breadboard: PANE_IDS.EAST_NORTH,
        tracing: PANE_IDS.EAST_SOUTH_CENTER,
        buttons: PANE_IDS.EAST_SOUTH_SOUTH,
        task: PANE_IDS.EAST_CENTER,
        lesson: PANE_IDS.MAIN_NORTH
    },
    simple: {
        launch_buttons: PANE_IDS.MAIN_CENTER,
        breadboard: PANE_IDS.MAIN_CENTER,
        task: PANE_IDS.EAST_CENTER,
        lesson: PANE_IDS.MAIN_NORTH
    },
    home: {
        course: PANE_IDS.MAIN_CENTER
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
        PANE_IDS.MAIN_NORTH,
        PANE_IDS.EAST_CENTER,
        PANE_IDS.EAST_SOUTH_SOUTH,
    ],
    simple: [
        PANE_IDS.MAIN_EAST,
        PANE_IDS.MAIN_NORTH,
        PANE_IDS.EAST_CENTER,
        PANE_IDS.EAST_SOUTH_SOUTH,
    ],
    home: []
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
const DURATION_INITIAL = 0;

/**
 * Модуль автоматической разметки страницы
 *
 * Автоматически распределяет зоны среды
 * и задаёт параметры их отображения
 *
 * @class
 * @classdesc APPROVED, STRESS-TESTED ON THROTTLED CPU
 */
export default class LayoutModule extends Module {
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
            transitionActive: false,
            transitionDummy: false,
            buttonsPaneVisible: true,
            firstLaunch: true,
            topPaneRevealed: false,
        };

        this._layout_options = this._getFullLayout();

        this._layout = $("." + ROOT_CLASS).layout(this._layout_options);

        this._panes = this._getPanes();

        this._busy = false;
        this._resizing = false;

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
            /// определить DOM-узлы компоновки
            let nodes = this._transformMappingToNodes(MAPPINGS[mode]);

            /// начальная продолжительность
            let duration = DURATION_INITIAL;

            /// если в данный момент идёт работа, отклонить
            if (this._busy) {
                return;
            }

            /// если уже в нужном режиме
            if (this._state.mode === mode) {
                /// занято
                this._busy = true;
                setTimeout(() => {
                    /// сообщить о готовности компоновки
                    if (this._state.firstLaunch && mode === MODES.FULL) {
                        this.emitEvent("compose-end", nodes);
                    }
                    /// разрешить вызов функции
                    this._busy = false;
                    /// разрешить выполнение следующей инструкции вызывающей программы
                    resolve();

                    this._state.firstLaunch = false;
                }, duration);

                return;
            }

            /// если режим нужно сменить, занято
            this._busy = true;

            /// если задана скорость анимации появления/исчезновения содержимого панелей
            if (this._options.animSpeedFade) {
                /// увеличить задержку
                duration += this._options.animSpeedFade;
                /// скрыть содержимое панелей
                this.hidePanes(this._state.mode);
            }

            /// сообщить о готовности начать компоновку
            setTimeout(() => {
                this.emitEvent("compose-begin", nodes);
            }, duration);

            /// если западная панель не раскрыта, раскрыть
            this._layout.open("east");

            /// в зависимости от режима, в который нужно перейти
            switch (mode) {
                case MODES.SIMPLE: {
                    // this._panes.east.hide("north");
                    // duration += this._options.animSpeedSub;

                    this._panes.east.hide("south");
                    duration += this._options.animSpeedSub;

                    this._layout.sizePane("east", .4);
                    duration += this._options.animSpeedMain;

                    if (this._state.buttonsPaneVisible) {
                        this._panes._east.south.hide("south");
                        duration += this._options.animSpeedSub;
                    }

                    break;
                }
                case MODES.FULL: {
                    if (this._state.topPaneRevealed) {
                        this.revealTopPane();
                    }

                    // this._panes.east.show("north");
                    // duration += this._options.animSpeedSub;

                    this._panes.east.show("south");
                    duration += this._options.animSpeedSub;

                    this._layout.sizePane("east", .3);
                    duration += this._options.animSpeedMain;

                    if (this._state.buttonsPaneVisible) {
                        this._panes._east.south.show("south");
                        duration += this._options.animSpeedSub;
                    }

                    break;
                }
                case MODES.HOME: {
                    // this._layout.hide("north");
                    this._layout.hide("east");
                    this.concealTopPane(true);
                    break;
                }
                default: {
                    throw new TypeError("Mode " + mode + "is not supported");
                }
            }

            this._state.mode = mode;

            /// задержка для анимации смены разметки
            setTimeout(() => {
                /// сообщить о готовности компоновки
                this.emitEvent("compose-end", nodes);
                /// задержка для анимации появления панелей
                setTimeout(() => {
                    /// разрешить вызов функции
                    this._busy = false;
                    /// разрешить выполнение следующей инструкции вызывающей программы
                    resolve();
                    this.showPanes();
                }, this._options.animSpeedFade); // задержка для анимации появления панелей
            }, duration); // задержка для анимации смены разметки

            this._state.firstLaunch = false;
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
            if (on === this._state.buttonsPaneVisible || this._state.mode === MODES.SIMPLE) {
                resolve();
                return;
            }

            let duration = DURATION_INITIAL;

            if (on) {
                this._state.buttonsPaneVisible = true;

                this._panes._east.south.show("south");
                duration += this._options.animSpeedSub;
            } else {
                this._state.buttonsPaneVisible = false;

                this._panes._east.south.hide("south");
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
     * @private
     */
    hidePanes(mode) {
        for (let pane_id of Object.values(PANE_IDS)) {
            if (FADEBLOCKINGS[mode].indexOf(pane_id) >= 0) {
                continue;
            }

            if (Object.values(MAPPINGS[mode]).indexOf(pane_id) >= 0) {
                $("#" + pane_id).animate({opacity: 0}, this._options.animSpeedFade)
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
     * @private
     */
    showPanes() {
        return new Promise(resolve => {
            for (let pane_id of Object.values(PANE_IDS)) {
                $("#" + pane_id).animate({opacity: 1}, this._options.animSpeedFade)
            }

            setTimeout(() => {resolve()}, this._options.animSpeedFade);
        });
    }

    revealTopPane() {
        this._layout.sizePane('north', 80);
        this._state.topPaneRevealed = true;
    }

    concealTopPane(temp=false) {
        this._layout.sizePane('north', 55);

        if (!temp) this._state.topPaneRevealed = false;
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
        if (!this._busy && !this._resizing) {
            this._resizing = true;

            if (this._state.mode === "simple") {
                this._layout.sizePane("east", .4);
            }

            if (this._state.mode === "full") {
                this._layout.sizePane("east", .3);
            }

            setTimeout(() => {
                this._resizing = false;
            }, this._options.animSpeedMain);
        }

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
            // livePaneResizing: true,
            fxSpeed: this._options.animSpeedMain,
            // resizeWhileDragging: true,

            fxName:     "slide",
            fxSettings: { duration: this._options.animSpeedMain, easing: "easeInOutCirc" },
            fxSettings_open: { duration: this._options.animSpeedMain, easing: "easeOutCirc" },
            fxSettings_close: { duration: this._options.animSpeedMain, easing: "easeOutCirc" },

            // fxSpeed_size: 1000,

            animatePaneSizing: true,
            onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},

            //	some resizing/toggling settings
            north: {
                slidable: false,	            // OVERRIDE the pane-default of 'slidable=true'
                closable: false,
                spacing_closed: 20,		        // big resizer-bar when open (zero height)
                size: 55,
                // maxSize: 100
            },

            center: {
            },

            //	some pane-size settings
            east: {
                size: .4,
                minSize: 340,

                livePaneResizing: true,
                resizable: true,

                fxSpeed: this._options.animSpeedMain,

                onresize: () => {try {this._onResize('east')} catch (e) {console.error(e)}},

                childOptions: {
                    center: {
                        size: .7,

                        resizable: true,
                        fxSpeed: this._options.animSpeedSub,
                        onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                    },
                    south: {
                        size: .3,
                        minSize: 150,

                        resizable: true,
                        fxSpeed: this._options.animSpeedSub,
                        onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},

                        childOptions: {
                            center: {
                                spacing_open: 0,
                                spacing_closed: 0,

                                resizable: true,
                                onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                            },
                            south: {
                                size: .2,
                                minSize: 35,
                                maxSize: 45,
                                spacing_open: 0,
                                spacing_closed: 0,
                                slidable: false,
                                closable: false,
                                onresize: () => {try {this._onResize()} catch (e) {console.error(e)}},
                            }
                        }
                    },
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
        return {
            north: this._layout.north,
            center: this._layout.center,
            east: this._layout.east.children.layout1,

            _east: {
                // north:  this._layout.east.children.layout1.north,
                south:  this._layout.east.children.layout1.south.children.layout1,
                center: this._layout.east.children.layout1.center,

                _south: {
                    center: this._layout.east.children.layout1.south.children.layout1.center,
                    south:  this._layout.east.children.layout1.south.children.layout1.south,
                }
            }
        }
    }


    _subscribeToWrapperEvents() {
        // No events
    }
}