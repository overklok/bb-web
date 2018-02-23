import Module from "../core/Module";

import TourWrapper from "../wrappers/TourWrapper";

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

        this._tour = new TourWrapper();

        this._valid_button_seq = [];
        this._seq_pointer_pos = undefined;

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

    validateButtonPress(code) {
        if (typeof this._valid_button_seq === "undefined") {
            return true;
        }

        /// если код нажатой клавиши совпал с ожидаемым
        if (code === this._valid_button_seq[this._seq_pointer_pos]) {
            /// если ожидаемый код - последний
            if ((this._seq_pointer_pos + 1) === this._valid_button_seq.length) {
                /// сбросить позицию указателя
                this._seq_pointer_pos = 0;
            } else {
                /// увеличить позицию указателя
                this._seq_pointer_pos += 1;
            }

            return true;
        }

        /// сбросить позицию указателя, если код не совпал
        this._seq_pointer_pos = 0;

        return false;
    }

    setValidButtonSequence(seq) {
        this._valid_button_seq = seq;
        this._seq_pointer_pos = 0;
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;