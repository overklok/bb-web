import Module from "../core/Module";
import BlocklyWrapper from "../wrappers/BlocklyWrapper";
import KbdPaneWrapper from "../wrappers/KbdPaneWrapper";

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
            areasDisp: {
                variable: false,
                codenet: false,
                buttons: false
            },
            display: false,
        };

        this._vars = [];

        this._blockly = new BlocklyWrapper();
        this._kbdpane = new KbdPaneWrapper();

        this._subscribeToWrapperEvents();
    }

    inject(dom_node, dom_node_buttons) {
        if (!dom_node) {return false}

        if (BlocklyWrapper.BLOCKLY_BLOCK_TYPES_REGISTERED === false) {
            throw new Error("Please modify this module to load Blockly block types or disable it");
        }

        if (this._state.areasDisp.codenet && this._state.areasDisp.variable) {return true}

        if (dom_node) {
            this._state.areasDisp.codenet = true;

            this._blockly.include(dom_node, false, true, 0.6);
            this._state.display = true;
        }

        if (dom_node_buttons) {
            this._state.areasDisp.buttons = true;

            this._kbdpane.include(dom_node_buttons, 10);
        }

        this._showVariables(this._vars);
    }

    eject() {
        if (!this._state.areasDisp.codenet && !this._state.areasDisp.variable) {return true}

        this._blockly.exclude();
        this._kbdpane.exclude();

        this._state.display = false;
    }

    resize() {
        if (this._state.areasDisp.codenet || this._state.areasDisp.variable) {
            this._blockly._onResize();
        }

        if (this._state.areasDisp.buttons) {
            this._kbdpane._onResize();
        }
    }

    registerVariables(variables) {
        this._vars = variables;

        if (this._state.display) {
            this._blockly.clearVariableBlocks();

            this._showVariables(this._vars);
        }
    }

    setVariableValue(variable_type, variable_value) {
        this._blockly.setVariableBlockValue(variable_type, variable_value);
    }

    displayKeyboardPress(keycode, fault=false) {
        this._kbdpane.addButton(keycode, fault);
    }

    switchVariables(on) {
        if (this._state.variable === on) {return true}

        if (on === false) {
            this._blockly.clearVariableBlocks();
        } else {
            this._showVariables(this._vars);
        }

        this._state.variable = on;
    }

    switchCodenet(on) {
        if (this._state.codenet === on) {return true}
    }

    switchButtons(on) {
        if (this._state.buttons === on) {return true}
    }

    _showVariables(variables) {
        if (this._state.display) {
            for (let variable of variables) {
                this._blockly.addVariableBlock(variable.name, variable.initial_value, variable.type);
            }
        }
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default TracingModule;