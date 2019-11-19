import BarItemBlock from "../../core/blocks/BarItemBlock";

const ITEM_TEXT_DEFAULT = "MENU_ITEM";

const TYPES = {
    RADIO: 'radio',
    DISABLED: 'disabled',
};

export default class MenuBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "menu-bar__item"}
    static get ModifierClassesDOM() {return ["leading"]}

    constructor(name, text=ITEM_TEXT_DEFAULT, text_sub=null, type=null, handler, right=false) {
        super();

        if (!name) {throw new TypeError("Parameter `name` is not defined")}

        this._name = name;
        this._text = text;
        this._text_sub = text_sub;
        this._type = type;
        this._handler = handler;
        this._right = right;

        this._state.pressed = false;
    }

    include(dom_node) {
        super.include(dom_node);

        // let sub = this._text_sub ? null : `<div class="${MenuBarItemBlock.ClassDOM}_text">${this._text}</div>`;

        this._container.innerHTML = `<div class="${MenuBarItemBlock.ClassDOM}_text">${this._text}</div>`;

        if (this._text_sub) {
            this._container.innerHTML += `<div class="${MenuBarItemBlock.ClassDOM}_text-sub">${this._text_sub}</div>`;
        }

        if (this._right) {
            this._container.classList.add('right');
        }

        if (this._type === TYPES.DISABLED) {
            this._container.classList.add('disabled');
            this._container.disabled = true;
        }

        this._attachCallbacks();
    }

    click(on=true) {
        if (this._type === TYPES.RADIO) {
            if (on) {
                this._container.classList.add('pressed');
            } else {
                this._container.classList.remove('pressed');
            }
        }

        this._state.pressed = on;

        if (typeof this._handler === 'function') {
            this._handler(this._name, this._state.pressed);
        }
    }

    _attachCallbacks() {
        this._container.onclick = () => {
            if (this._type === TYPES.RADIO) {
                this._state.pressed = !this._state.pressed;
            }
            this.click(this._state.pressed);
        };
    }
}
