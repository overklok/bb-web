import Wrapper from "../core/Wrapper";

import thm from "../../css/launch-button.css";

const IDS = {
    EXECUTE_BTN: "execute-btn",
    CHECK_BTN: "check-btn",
};

const CLASSES = {
    LAUNCH_PANE: "launch-pane",
    LAUNCH_BTN: "launch-btn",
};

const VARIANTS = {
    CHECK: 0,
    EXECUTE: 1,
    CHECK_N_EXECUTE: 2,
};

export default class LaunchBtnWrapper extends Wrapper {
    constructor() {
        super();

        this._callbacks = {
            button_click: (button, start) => {console.warn(`Unhandled button click, button=${button}, start=${start}`)},
        };

        this._captions = {
            execute: {
                start: `<i class="fas fa-play"></i>&nbsp;<small>Запустить</small>`,
                stop: `<i class="fas fa-stop"></i>&nbsp;<small>Остановить</small>`,
            },
            check: {
                start: `<i class="fas fa-forward"></i>&nbsp;<small>Проверить</small>`,
                stop: `<i class="fas fa-sync fa-spin fa-fw"></i>`,
            }
        };

        this._buttons = {
            check: undefined,
            execute: undefined,
        };

        this._started = {
            check: false,
            execute: false,
        };
    }

    inject(dom_node) {
        this._ensureButtons(dom_node);
        this.hide();

        return Promise.resolve(true);
    }

    show(variant) {
        switch (variant) {
            case VARIANTS.CHECK: {
                this._buttons.check.style.display = "inline";
                this._buttons.execute.style.display = "none";
                break;
            }
            case VARIANTS.EXECUTE: {
                this._buttons.check.style.display = "none";
                this._buttons.execute.style.display = "inline";
                break;
            }
            case VARIANTS.CHECK_N_EXECUTE: {
                this._buttons.check.style.display = "inline";
                this._buttons.execute.style.display = "inline";
                break;
            }
            default: {
                this._buttons.check.style.display = "none";
                this._buttons.execute.style.display = "none";
                break;
            }
        }

        for (let button_key in this._buttons) {
            this.setStart(button_key);
        }
    }

    hide() {
        this._buttons.execute.style.display = "none";
        this._buttons.check.style.display = "none";
    }

    setStart(button_key) {
        if (!(button_key in this._buttons)) {throw new RangeError(`There is no '${button_key}' button`)}

        this._buttons[button_key].innerHTML = this._captions[button_key].start;
        this._started[button_key] = false;
    }

    setStop(button_key) {
        if (!(button_key in this._buttons)) {throw new RangeError(`There is no '${button_key}' button`)}

        this._buttons[button_key].innerHTML = this._captions[button_key].stop;
        this._started[button_key] = true;
    }

    onButtonClick(cb) {
        this._callbacks.button_click = cb;
    }

    _ensureButtons(dom_node) {
        let parent = document.createElement("div");
        parent.classList.add(CLASSES.LAUNCH_PANE);

        this._buttons = {
            execute: document.createElement("div"),
            check: document.createElement("div"),
        };

        this._buttons.execute.id = IDS.EXECUTE_BTN;
        this._buttons.check.id = IDS.CHECK_BTN;

        this._buttons.execute.classList.add(CLASSES.LAUNCH_BTN);
        this._buttons.check.classList.add(CLASSES.LAUNCH_BTN);

        parent.appendChild(this._buttons.execute);
        parent.appendChild(this._buttons.check);

        dom_node.appendChild(parent);

        this._buttons.execute.onclick = (evt) => {
            this._callbacks.button_click('execute', !this._started.execute);
        };

        this._buttons.check.onclick = (evt) => {
            this._callbacks.button_click('check', !this._started.check);
        };
    }
}