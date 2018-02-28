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
                blocks: false,
                buttons: false
            },
        };

        this._vars = [];

        this._blockly = new BlocklyWrapper();
        this._kbdpane = new KbdPaneWrapper();

        this._subscribeToWrapperEvents();
    }

    injectBlocks(dom_node) {
        return new Promise(resolve => {
            if (!dom_node) {
                resolve(false);
                return
            }

            if (BlocklyWrapper.BLOCKLY_BLOCK_TYPES_REGISTERED === false) {
                throw new Error("Please modify this module to load Blockly block types or disable it");
            }

            if (this._state.areasDisp.blocks) {
                resolve(true);
                return;
            }

            this._blockly.inject(dom_node, false, true, 0.8);

            this._showVariables(this._vars);

            this._state.areasDisp.blocks = true;
            resolve(true);
        });
    }

    ejectBlocks() {
        return new Promise(resolve => {
            if (!this._state.areasDisp.blocks) {
                resolve(true);
                return;
            }

            this._blockly.clearVariableBlocks();
            this._blockly.eject();

            this._state.areasDisp.blocks = false;

            resolve(true);
        })
    }

    injectButtons(dom_node_buttons) {
        return new Promise(resolve => {
            if (!dom_node_buttons) {
                resolve(true);
                return;
            }

            if (this._state.areasDisp.buttons) {
                resolve(true);
                return;
            }

            this._state.areasDisp.buttons = true;

            this._kbdpane.include(dom_node_buttons, 10);

            resolve(true);
        });
    }

    ejectButtons() {
        return new Promise(resolve => {
            if (!this._state.areasDisp.buttons) {
                resolve(true);
                return;
            }

            this._kbdpane.exclude();
            this._state.areasDisp.buttons = false;

            resolve(true);
        });
    }

    resize() {
        if (this._state.areasDisp.blocks) {
            this._blockly._onResize();
        }

        if (this._state.areasDisp.buttons) {
            this._kbdpane._onResize();
        }
    }

    registerVariables(variables) {
        if (typeof variables === "undefined") {return false}

        this._vars = variables;

        if (!this._state.areasDisp.blocks) {return true}

        this._blockly.clearVariableBlocks();

        if (this._vars.length > 0) {
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
        if (this._state.areasDisp.blocks === on) {return true}

        if (on === false) {
            this._blockly.clearVariableBlocks();
        } else {
            this._showVariables(this._vars);
        }

        this._state.variable = on;
    }

    switchCodenet(on) {
        if (this._state.areasDisp.blocks === on) {return true}
    }

    switchButtons(on) {
        if (this._state.areasDisp.buttons === on) {return true}
    }

    clearButtons() {
        if (!this._state.areasDisp.buttons) {
            return Promise.resolve(false)
        }

        this._kbdpane.clear();

        return Promise.resolve(true);
    }

    _showVariables(variables) {
        for (let variable of variables) {
            this._blockly.addVariableBlock(variable.name, variable.type, variable.initial_value);
        }
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default TracingModule;