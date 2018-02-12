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
    static get event_types() {return []}

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
    }

    include(dom_node) {
        if (dom_node !== undefined) {
            this._blockly.include(dom_node);
            this._display = true;
        }

        // console.log(Object.keys(JSONBlocks));

        if (this._options.allBlocks) {
            this._blockly.useBlockTypes(Object.keys(JSONBlocks));
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
        // No events
    }
}

export default WorkspaceModule;