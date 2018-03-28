import ChipBlock from "../../core/blocks/ChipBlock";

import thm from "../../styles/chips/task-chip/task-chip.css";

class TaskChipBlock extends ChipBlock {
    static get ClassDOM() {return "task-chip"}

    constructor() {
        super();
    }

    include(dom_node) {
        super.include(dom_node);
    }

    hide() {
        this._container.classList.add("hidden");
    }

    show() {
        this._container.classList.remove("hidden");
    }

    setText(text) {
        this._container.innerHTML = `<p>${text}</p>`;
    }
}

export default TaskChipBlock;