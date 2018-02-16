import Module from '../core/Module'

import BlocklyWrapper from '../wrappers/BlocklyWrapper'
import VirtLEDWrapper from '../wrappers/VirtLEDWrapper'

import JSONBlocks       from '../~utils/blockly/extras/blocks';
import JSONGenerators   from '../~utils/blockly/extras/generators';

/**
 * Модуль "Рабочая область"
 *
 * Предоставляет набор методов для управления интерфейсом Blockly
 */
class WorkspaceModule extends Module {
    static get eventspace_name() {return "ws"}
    static get event_types() {return ["change"]}

    static defaults() {
        return {
            allBlocks: false,
            useScrollbars: false
        }
    }

    constructor(options) {
        super(options);

        this._blockly  = new BlocklyWrapper();
        this._display = false;

        this._blockly.registerBlockTypes(JSONBlocks);
        this._blockly.registerGenerators(JSONGenerators);

        this._subscribeToWrapperEvents();
    }

    include(dom_node) {
        if (dom_node !== undefined) {
            this._blockly.include(dom_node, this._options.useScrollbars);
            this._display = true;
        }

        // console.log(Object.keys(JSONBlocks));

        if (this._options.allBlocks) {
            this._blockly.useBlockTypes(Object.keys(JSONGenerators));
            this._blockly.setAudibles(['event_key_onpush_letter', 'event_key_onpush_number']);
        } else {
            // this._blockly.useBlockTypes(['leds_off', 'wait_seconds', 'controls_repeat_ext', 'controls_if', 'logic_boolean']);
        }
    }

    exclude() {
        this._blockly.exclude();
        this._display = false;
    }

    resize() {
        this._blockly._onResize();
    }

    highlightBlock(block_id) {
        this._blockly.highlightBlock(block_id);
    }

    getHandlers() {
        return this._blockly.getJSONHandlers();
    }

    getTree() {
        return this._blockly.getXMLText();
    }

    loadTree(tree) {
        if (!tree) {return false}

        this._blockly.setXMLText(tree);
    }

    pipeUp() {
        this._blockly.silent = false;
    }

    shutUp() {
        this._blockly.silent = true;
    }

    _subscribeToWrapperEvents() {
        /**
         * При изменении главного кода
         */
        // this._blockly.onChangeMain(main_code => {
        //     this.emitEvent("change", {
        //         main: {
        //             commands:   main_code,
        //             btn:        "None"
        //         },
        //     });
        // });

        this._blockly.onChangeAudible((audible_id, audible_args) => {
            audible_args.code = WorkspaceModule._preprocessCode(audible_args.code);

            let data_to_send = {};

            data_to_send[audible_id] = {
                code:   audible_args.code,
                btn:    audible_args.btn
            };

            this.emitEvent("change", data_to_send);
        });
    }

    static _preprocessCode(code) {
        if (!code) return code;

        if (code.slice(-1) === ",") {
            code = code.slice(0, -1);
        }

        return code;
    }
}

export default WorkspaceModule;