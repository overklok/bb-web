import Wrapper from "../core/Wrapper";

const BUTTON_ID = "launch-btn";
const BUTTON_CLASS = "launch-btn";

import thm from "../../css/launch-button.css";

const VARIANTS = {
    CHECK: 0,
    LAUNCH: 1,
    CHECK_N_LAUNCH: 2,
};

class LaunchBtnWrapper extends Wrapper {
    constructor() {
        super();

        this._button = undefined;

        this._callbacks = {
            button_click: (check, start) => {console.warn(`Unhandled launch button click, check = ${check}, start=${start}`)}
        };

        this._caption_start = "TEXT_START";
        this._caption_stop = "TEXT_STOP";

        this._started = false;
    }

    show(variant) {
        this._ensureButton();

        this._button.style.display = "block";

        switch (variant) {
            case VARIANTS.CHECK: {
                this._caption_start = "Проверить";
                this._caption_stop = "Проверяем...";
                break;
            }
            case VARIANTS.LAUNCH: {
                this._caption_start = "Запустить";
                this._caption_stop = "Остановить";
                break;
            }
            case VARIANTS.CHECK_N_LAUNCH: {
                this._caption_start = "Запустить и проверить";
                this._caption_stop = "Остановить";
                break;
            }
        }

        this.setStart();

        this._button.onclick = (evt) => {
            this._callbacks.button_click(variant, !this._started);
        };
    }

    hide() {
        this._ensureButton();

        this._button.style.display = "none";
    }

    setStart() {
        this._ensureButton();

        this._button.innerText = this._caption_start;
        this._started = false;
    }

    setStop() {
        this._ensureButton();

        this._button.innerText = this._caption_stop;
        this._started = true;
    }

    onButtonClick(cb) {
        this._callbacks.button_click = cb;
    }

    _ensureButton() {
        if (!this._button) {
            this._button = document.getElementById(BUTTON_ID);
            this._button.classList.add(BUTTON_CLASS)
        }
    }
}

export default LaunchBtnWrapper;