import Module from "../core/Module";
import BlocklyWrapper from "../wrappers/BlocklyWrapper";

import JSONBlocks       from '../~utils/blockly/extras/blocks';

class TracingModule extends Module {
    static get eventspace_name() {return "trc"}
    static get event_types() {return []}

    static defaults() {
        return {

        }
    }

    constructor(options) {
        super(options);

        this._state = {
            areas: {
                variables: false,
                codenet: false,
                buttons: false
            },
            var_types: [],
        };

        this._blockly = new BlocklyWrapper();

        this._subscribeToWrapperEvents();
    }

    inject(dom_node, dom_node_buttons) {
        if (!dom_node) {return false}

        if (BlocklyWrapper.BLOCKLY_BLOCK_TYPES_REGISTERED === false) {
            throw new Error("Please modify this module to load Blockly block types or disable it");
        }

        if (this._state.areas.codenet && this._state.areas.variables) {return true}

        if (dom_node) {
            this._state.areas.codenet = true;
        }

        if (dom_node_buttons) {
            this._state.areas.codenet = true;
        }

        this._blockly.include(dom_node, false, true, 0.75);

        this._blockly.createVariableBlock("strip_index", 0);
        this._blockly.createVariableBlock("strip_colour", "чёрный");
    }

    eject() {
        if (!this._state.areas.codenet && !this._state.areas.variables) {return true}

        this._blockly.exclude();
        this._state.display = false;
    }

    resize() {
         if (this._state.areas.codenet || this._state.areas.variables) {
            this._blockly._onResize();
        }
    }

    setVariableValue(variable_type, variable_value) {

    }

    setVariableTypes(variable_types) {
    }

    switchVariables(on) {
        if (this._state.variables === on) {return true}
    }

    switchCodenet(on) {
        if (this._state.codenet === on) {return true}
    }

    switchButtons(on) {
        if (this._state.buttons === on) {return true}
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default TracingModule;