import Module from '../core/Module'

import BlocklyWrapper from '../wrappers/BlocklyWrapper'
import VirtLEDWrapper from '../wrappers/VirtLEDWrapper'

import {JSONBlocks, XMLBlocks} from '../~utils/blockly/extras/blocks';
import JSONGenerators from '../~utils/blockly/extras/generators';

/**
 * Модуль "Рабочая область"
 *
 * Предоставляет набор методов для управления интерфейсом Blockly
 */
class WorkspaceModule extends Module {
    static get eventspace_name() {return "ws"}
    static get event_types() {return []}

    constructor() {
        super();

        this._blockly  = new BlocklyWrapper();
        this._display = false;

        this._blockly.registerBlockTypes(JSONBlocks, XMLBlocks);
        this._blockly.registerGenerators(JSONGenerators);
    }

    include(dom_node) {
        if (dom_node !== undefined) {
            this._blockly.include(dom_node);
            this._display = true;
        }

        this._blockly.useBlockTypes(['leds_off', 'wait_seconds', 'controls_repeat_ext', 'controls_if', 'logic_boolean']);
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
        // return this._blockly.getXMLCode();
    }

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default WorkspaceModule;