import Module from "../core/Module";

const API = {
    STATUS_CODES: {
        PASS: "OK",
        FAULT: "error"
    }
};

class InstructorModule extends Module {
    static get eventspace_name() {return "ins"}
    static get event_types() {return ["pass", "fault", "error"]}

    static defaults() {
        return {
        }
    }

    constructor(options) {
        super(options);

        this._subscribeToWrapperEvents();
    }

    applyVerdict(verdict) {
        if (verdict.status === API.STATUS_CODES.PASS) {
            this.emitEvent("pass", {
                message: "молодец продолжай дальше"
            });
        }

        if (verdict.status === API.STATUS_CODES.FAULT) {
            this.emitEvent("fault", {
                message: verdict.html,
                blocks: verdict.blocks
            });
        }
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;