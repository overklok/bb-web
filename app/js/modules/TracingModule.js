import Module from "../core/Module";
import BlocklyWrapper from "../wrappers/BlocklyWrapper";

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

        if (BlocklyWrapper.BLOCKLY_BLOCK_TYPES_REGISTERED() === false) {
            throw new Error("Please modify this module to load Blockly block types or disable it");
        }

        this._subscribeToWrapperEvents();
    }

    setVariableValue(variable_type, variable_value) {

    }

    setVariableTypes(variable_types) {

    }

    switchVariables(on) {

    }

    switchCodenet(on) {

    }

    switchButtons(on) {

    }

    _subscribeToWrapperEvents() {
        // stub
    }
}