import Module from "../core/Module";

class InstructorModule extends Module {
    static get eventspace_name() {return "ins"}
    static get event_types() {return ["error"]}

    static defaults() {
        return {}
    }

    constructor(options) {
        super(options);

        this._subscribeToWrapperEvents();
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;