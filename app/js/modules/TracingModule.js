import Module from "../core/Module";
import BlocklyWrapper from "../wrappers/BlocklyWrapper";
import KbdPaneWrapper from "../wrappers/KbdPaneWrapper";
import PaneVariables from "../utils/pane-variables/PaneVariables";

import JSONBlocks       from '../utils/blockly/extras/blocks';

/**
 * Модуль, отвечающий за поведение области трассировки кода
 *
 * Например:
 * Текущие переменные
 * История выполняемых команд
 */
export default class TracingModule extends Module {
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
                vars: false,
                buttons: false
            },
        };

        this._vars = [];
        this._show_sensors = false;

        this._blockly = new BlocklyWrapper();
        this._kbdpane = new KbdPaneWrapper();

        this._varpane = new PaneVariables();

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

            if (this._state.areasDisp.vars) {
                resolve(true);
                return;
            }

            // this._blockly.inject(dom_node, false, true, 3);
            this._varpane.include(dom_node);

            this._showVariables(this._vars);

            this._state.areasDisp.vars = true;
            resolve(true);
        });
    }

    ejectBlocks() {
        return new Promise(resolve => {
            if (!this._state.areasDisp.vars) {
                resolve(false);
                return;
            }

            this._varpane.removeAllVariables();
            this._varpane.dispose();
            // this._blockly.clearVariableBlocks();
            // this._blockly.eject();

            this._state.areasDisp.vars = false;

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
        if (this._state.areasDisp.vars) {
            // this._blockly._onResize();
        }

        if (this._state.areasDisp.buttons) {
            this._kbdpane._onResize();
        }
    }

    registerVariables(variables) {
        if (typeof variables === "undefined") {return false}

        this._vars = variables;

        if (!this._state.areasDisp.vars) {return false}

        // this._blockly.clearVariableBlocks();
        this._varpane.removeAllVariables();

        if (this._vars.length > 0) {
            this._showVariables(this._vars);
        }

        return true;
    }

    setVariableValue(variable_name, variable_value) {
        if (variable_name == 'arduino_out_value') {

        } else {
            this._varpane.setValue(variable_name, variable_value, true);
        }
        // this._blockly.setVariableBlockValue(variable_type, variable_value);
    }

    setPinsValues(values) {
        this._varpane.setSensorValues(values, true);
    }

    addHistoryBlock(block_id, workspace_src) {
        if (!this._state.areasDisp.vars) {return false}
        // this._blockly.addHistoryBlock(block_id, workspace_src);

        return true;
    }

    clearHistoryBlocks() {
        return new Promise(resolve => {
            if (!this._state.areasDisp.vars) {
                resolve(false);
            }

            // this._blockly.clearHistoryBlocks();

            resolve(true);
        });
    }

    displayKeyboardPress(keycode, fault=false) {
        if (!this._state.areasDisp.buttons) {return true}

        this._kbdpane.addButton(keycode, fault);
    }

    switchVariables(on) {
        if (this._state.areasDisp.vars === on) {return true}

        if (on === false) {
            this._varpane.removeAllVariables();
            // this._blockly.clearVariableBlocks();
        } else {
            this._showVariables(this._vars);
        }

        this._state.variable = on;
    }

    switchCodenet(on) {
        if (this._state.areasDisp.vars === on) {return true}
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
            if (variable.name === 'board_sensors') {
                this._varpane.addSensors();
            } else {
                this._varpane.addVariable(variable.name, variable.initial_value);
                // this._blockly.addVariableBlock(variable.name, variable.name, variable.initial_value);
            }
        }
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}