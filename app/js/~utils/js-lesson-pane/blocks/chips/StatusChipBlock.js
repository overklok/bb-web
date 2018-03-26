import ChipBlock from "../../core/blocks/ChipBlock";

import thm from "../../styles/chips/status-chip/status-chip.css";

const CLASSES = {
    INDICATOR: "indicator"
};

class StatusChipBlock extends ChipBlock {
    static get ClassDOM() {return "status-chip"}

    constructor() {
        super();

        this._containers = {
            indicator: undefined
        };
    }

    include(dom_node) {
        super.include(dom_node);

        this._containers.indicator = document.createElement("div");
        this._containers.indicator.classList.add(StatusChipBlock.ClassDOM + '_' + CLASSES.INDICATOR);
        this._container.appendChild(this._containers.indicator);
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

    setDefault() {
        this._clearIndicatorStatus();
    }

    _clearIndicatorStatus() {
        this._containers.indicator.classList = StatusChipBlock.ClassDOM + '_' + CLASSES.INDICATOR;
    }
}

export default StatusChipBlock;