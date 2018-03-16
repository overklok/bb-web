import ChipBlock from "../../core/blocks/ChipBlock";

import thm from "../../styles/chips/menu-chip/menu-chip.css";

const LABELS = {
    MENU: "Меню"
};

class MenuChipBlock extends ChipBlock {
    static get ClassDOM() {return "menu-chip"}

    constructor() {
        super();

        this._containers = {
            button: undefined,
        };

        this._callbacks = {
            onclick: (pressed) => {console.warn("Unhandled event 'click' were triggered width data:", pressed)}
        };

        this._state.pressed = false;
    }

    include(dom_node) {
        super.include(dom_node);

        this._containers.button = document.createElement("a");
        this._container.appendChild(this._containers.button);

        this._containers.button.innerHTML = `${LABELS.MENU}`;

        this._attachCallbacks();
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        this._containers.button.onclick = () => {
            this._state.pressed = !this._state.pressed;

            if (!this._state.pressed) {
                this._containers.button.classList.remove("pressed");
            } else {
                this._containers.button.classList.add("pressed");
            }

            this._callbacks.onclick(this._state.pressed);
        };
    }
}

export default MenuChipBlock;