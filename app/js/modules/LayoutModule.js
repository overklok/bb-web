import Module from "../core/Module";

import layout   from "../../vendor/js/jquery.layout.js";
require("jquery-ui-bundle");

import styles from "../../css/layout.css";

const PANE_IDS = {
    MAIN: {
        CENTER: "main-center",
        EAST: "main-east"
    },
    EAST: {
        NORTH: "east-north",
        CENTER: {
            CENTER: "east-center-center",
            SOUTH: "east-center-south"
        },
        SOUTH: "east-south"
    }
};

const MODES = {
    FULL:   "full",
    SIMPLE: "simple"
};

const DURATION_INITIAL = 100;

/// jQuery Layout conflict fix
(function ($){$.fn.selector = { split: function() { return ""; }};})(jQuery);

/**
 * Модуль автоматической разметки страницы
 *
 * Автоматически распределяет зоны среды
 * и задаёт параметры их отображения
 */
class LayoutModule extends Module {
    static get eventspace_name() {return "lay"}
    static get event_types() {return ["compose", "resize"]}

    static defaults() {
        return {
            animSpeedMain: 500,
            animSpeedSub: 100
        }
    }

    constructor(options) {
        super(options);

        this._state = {
            mode: undefined,
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
    }

    /**
     * Скомпоновать разметку страницы
     *
     * @param mode {int} режим компоновки
     */
    compose(mode) {
        return new Promise(resolve => {
            if (this._state.mode === mode) {
                resolve();
                return;
            }

            let duration = DURATION_INITIAL;

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
            // let nodes = this._transformMapToNodes(layout_map);

            this._state.mode = mode;

            setTimeout(resolve, duration);
        });
    }

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

            setTimeout(resolve, duration);
        });
    }


    /**
     * Преобразовать соответствия "ID области" -> "ID DOM-узла области"
     * в соответствия "ID области" -> "DOM-узел области"
     *
     * @param map {Object}  Соответствия "ID области" -> "ID DOM-узла области"
     * @returns {Object}    Соответствия "ID области" -> "DOM-узел области"
     * @private
     */
    _transformMapToNodes(map) {
        let nodes = {};

        for ([k, node_id] of Object.entries(map)) {
            nodes[k] = document.getElementById(node_id);
        }

        return nodes;
    }

    _onResize() {
        this.emitEvent("resize");
    }

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
                childOptions: {
                    north: {
                        size: .3,
                        fxSpeed: this._options.animSpeedSub,
                    },
                    south: {
                        size: .4,
                        fxSpeed: this._options.animSpeedSub,
                    },
                    center: {
                        childOptions: {
                            south: {
                              size: .2,
                                slidable: false,
                                closable: false,
                            }
                        }
                    }
                }
            },
        };
    }

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