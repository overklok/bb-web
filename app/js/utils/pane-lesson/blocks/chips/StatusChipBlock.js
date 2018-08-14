import ChipBlock from "../../core/blocks/ChipBlock";

import thm from "../../styles/chips/status-chip/status-chip.css";

const CLASSES = {
    INDICATOR: "indicator"
};

export default class StatusChipBlock extends ChipBlock {
    static get ClassDOM() {return "status-chip"}

    constructor() {
        super();

        this._containers = {
            indicator: undefined
        };

         this._callbacks = {
            onclick: (pressed) => {console.warn("Unhandled event 'click' was triggered with data:", pressed)}
        };
    }

    include(dom_node) {
        super.include(dom_node);

        this._containers.indicator = document.createElement("div");
        this._containers.indicator.classList.add(StatusChipBlock.ClassDOM + '_' + CLASSES.INDICATOR);
        this._container.appendChild(this._containers.indicator);

        this._attachCallbacks();
    }

    setSuccess() {
        this._clearIndicatorStatus();
        this._containers.indicator.classList.add("success");
    }

    setWarning() {
        this._clearIndicatorStatus();
        this._containers.indicator.classList.add("warning");
    }

    setError() {
        this._clearIndicatorStatus();
        this._containers.indicator.classList.add("error");
    }

    setActive() {
        this._clearIndicatorStatus();
        this._containers.indicator.classList.add("active");
    }

    setDefault() {
        this._clearIndicatorStatus();
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _clearIndicatorStatus() {
        this._containers.indicator.classList = StatusChipBlock.ClassDOM + '_' + CLASSES.INDICATOR;
    }

    _attachCallbacks() {
        this._container.onclick = () => {
            this._callbacks.onclick();
        };
    }
}