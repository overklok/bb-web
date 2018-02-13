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
    static get event_types() {return ["change-main", "change-deep"]}

    static defaults() {
        return {
            allBlocks: false
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
            this._blockly.include(dom_node);
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

    getCode() {
        return this._blockly.getJSONCode();
    }

    getTree() {
        return this._blockly.getXMLText();
    }

    loadTree(tree) {
        if (!tree) {return false}

        this._blockly.setXMLText(tree);
    }

    _subscribeToWrapperEvents() {
        this._blockly.onChange(() => {this.emitEvent("change-main")});

        this._blockly.onChangeDeep((block_code, statement_code) => {
            this.emitEvent("change-deep", {
                block_code: block_code,
                statement_code: statement_code
            })
        });
    }
}

export default WorkspaceModule;