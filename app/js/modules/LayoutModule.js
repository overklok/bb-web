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
    DEFAULT: "default",
    DEBUG: "debug"
};

/// jQuery Layout conflict fix
(function ($){$.fn.selector = { split: function() { return ""; }};})(jQuery);

class LayoutModule extends Module {
    static get eventspace_name() {return "lay"}
    static get event_types() {return ["compose", "resize"]}

    constructor(options) {
        super(options);

        this._layout = undefined;

        this._layout_options_default = {
            closable: true	// pane can open & close
                , resizable: true	// when open, pane can be resized
                , slidable: true	// when closed, pane can 'slide' open over other panes - closes on mouse-out
                , livePaneResizing: true,

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
                    size: .2,
                    childOptions: {
                        north: {
                            size: .3
                        },
                        south: {
                            size: .4
                        }
                    }
                },
        };
        this._layout_options_debug = this._layout_options_default;

        this._layout_map_default = {
            editor: PANE_IDS.MAIN.CENTER,
            board: PANE_IDS.EAST.SOUTH,
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