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
            display: false,
        };

        this._var_types = [];

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
        this._state.display = true;

        this._showVariableTypes(this._var_types);
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

    registerVariableTypes(variable_types) {
        this._var_types = variable_types;

        if (this._state.display) {
            this._blockly.clearVariableBlocks();

            this._showVariableTypes(this._var_types);
        }
    }

    setVariableValue(variable_type, variable_value) {
        this._blockly.setVariableValue(variable_type, variable_value);
    }

    switchVariables(on) {
        if (this._state.variables === on) {return true}

        if (on === false) {
            this._blockly.clearVariableBlocks();
        } else {
            this._showVariableTypes(this._var_types);
        }

        this._state.variables = on;
    }

    switchCodenet(on) {
        if (this._state.codenet === on) {return true}
    }

    switchButtons(on) {
        if (this._state.buttons === on) {return true}
    }

    _showVariableTypes(variable_types) {
        if (this._state.display) {
            for (let variable_type of variable_types) {
                this._blockly.showVariableBlock(variable_type.name, variable_type.initial_value);
            }
        }
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default TracingModule;