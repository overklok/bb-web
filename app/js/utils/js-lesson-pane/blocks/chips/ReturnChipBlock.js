import ChipBlock from "../../core/blocks/ChipBlock";

import thm from "../../styles/chips/return-chip/return-chip.css";

const LABELS = {
    RETURN: "Вернуться"
};

export default class ReturnChipBlock extends ChipBlock {
    static get ClassDOM() {return "return-chip"}
    static get IconClassDOM() {return "return-chip-icon"}

    constructor() {
        super();

        this._containers = {
            button: undefined,
            icon: undefined,
        };

        this._callbacks = {
            onclick: (pressed) => {console.warn("Unhandled event 'click' were triggered with data:", pressed)}
        };
    }

    include(dom_node) {
        super.include(dom_node);

        this._containers.icon = document.createElement("p");
        this._containers.button = document.createElement("a");

        this._containers.icon.classList.add(ReturnChipBlock.IconClassDOM);
        this._containers.icon.innerHTML = "<i class=\"fas fa-undo\"></i>";

        this._container.appendChild(this._containers.icon);
        this._container.appendChild(this._containers.button);

        this._containers.button.innerHTML = `${LABELS.RETURN}`;

        this._attachCallbacks();
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        this._containers.button.onclick = () => {
            this._callbacks.onclick();
        };
    }
}