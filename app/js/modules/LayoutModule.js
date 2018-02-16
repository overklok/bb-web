import Module from "../core/Module";

import layout   from "../../vendor/js/jquery.layout.js";
// import ui       from "../../vendor/js/jquery.ui.js";
require("jquery-ui-bundle");

import styles from "../../css/layout.css";

const PANE_IDS = {
    MAIN: {
        CENTER: "main-center",
        EAST: "main-east"
    },
    EAST: {
        NORTH: "east-north",
        CENTER: "east-center",
        SOUTH: "east-south"
    }
};

const MODES = {
    DEFAULT:    "default",
    SIMPLE:     "simple",
    DEBUG:      "debug",
};

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
            animSpeed: 500
        }
    }

    constructor(options) {
        super(options);

        this._layout = undefined;

        console.log(this._state);

        this._layout_options_default = {
            closable: true,	    // pane can open & close
            resizable: true,	// when open, pane can be resized
            slidable: true,	    // when closed, pane can 'slide' open over other panes - closes on mouse-out
            livePaneResizing: true,
            fxSpeed: this._options.animSpeed,
            animatePaneSizing: true,

            //	some resizing/toggling settings
            north: {
                slidable: false,	            // OVERRIDE the pane-default of 'slidable=true'
                closable: false,
                spacing_closed: 20,		        // big resizer-bar when open (zero height)
                size: .1,
                maxSize: 100
            },

            center: {
                onresize_end: () => {this.emitEvent("resize")},
            },

            //	some pane-size settings
            east: {
                size: .3,
                fxSpeed: this._options.animSpeed,
                childOptions: {
                    north: {
                        size: .3,
                        fxSpeed: this._options.animSpeed / 5,
                    },
                    south: {
                        size: .4,
                        fxSpeed: this._options.animSpeed / 5,
                    }
                }
            },
        };
        this._layout_options_simple = Object.assign({}, this._layout_options_default);
        this._layout_options_debug = this._layout_options_default;

        this._layout_options_simple.east = {
            size: .4,
            fxSpeed: this._options.animSpeed,
            childOptions: {
                north: {
                    initClosed: true,
                    closable: false,
                },
                south: {
                    initClosed: true,
                    closable: false,
                }
            }
        };

        this._layout_map_default = {
            editor: PANE_IDS.MAIN.CENTER,
            board: PANE_IDS.EAST.SOUTH,
        };

        this._layout_map_simple = {
            editor: PANE_IDS.MAIN.CENTER,
            board: PANE_IDS.EAST,
        };

        this._layout_map_debug = {
            editor: PANE_IDS.EAST.SOUTH,
            board: PANE_IDS.MAIN.CENTER,
        };

        this.compose();
    }

    /**
     * Скомпоновать разметку страницы
     *
     * @param mode {int} режим компоновки
     */
    compose(mode) {
        let layout_options  = undefined;
        let layout_map      = undefined;

        switch(mode) {
            case MODES.DEBUG: {
                layout_options  = this._layout_options_debug;
                layout_map      = this._layout_map_debug;
                break;
            }
            case MODES.SIMPLE: {
                layout_options  = this._layout_options_simple;
                layout_map      = this._layout_map_simple;
                break;
            }
            case MODES.DEFAULT:
            default: {
                layout_options  = this._layout_options_default;
                layout_map      = this._layout_map_default;
                break;
            }
        }

        $(document).ready(() => {
            this._layout = $('body').layout(layout_options);

            let nodes = this._transformMapToNodes(layout_map);

            this.emitEvent("compose", nodes);

            this._debug.log("Layout composed: ", nodes);
        });
    }

    switchMode(mode_from, mode_to) {
        return new Promise(resolve => {
            if (mode_from === MODES.DEFAULT && mode_to === MODES.SIMPLE) {
                this._layout.east.children.layout1.south.options.onhide_end = () => {
                    this._layout.east.children.layout1.south.options.onhide_end = null;
                    resolve();
                };

                this._layout.east.children.layout1.hide("north");
                this._layout.east.children.layout1.hide("south");
                this._layout.sizePane("east", .4);
            }

            if (mode_from === MODES.SIMPLE && mode_to === MODES.DEFAULT) {
                this._layout.east.children.layout1.south.options.onshow_end = () => {
                    this._layout.east.children.layout1.south.options.onshow_end = null;
                    resolve();
                };

                this._layout.sizePane("east", .3);
                this._layout.east.children.layout1.show("north");
                this._layout.east.children.layout1.show("south");
            }
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

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default LayoutModule;