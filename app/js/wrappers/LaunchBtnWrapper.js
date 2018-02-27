import Wrapper from "../core/Wrapper";

const BUTTON_ID = "launch-btn";

import thm from "../../css/launch-button.css";

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

    show(check) {
        this._ensureButton();

        this._button.style.display = "block";

        if (check) {
            this._caption_start = "Проверить";
            this._caption_stop = "Проверяем...";
        } else {
            this._caption_start = "Запустить";
            this._caption_stop = "Остановить"
        }

        this.setStart();

        this._button.onclick = (evt) => {
            this._callbacks.button_click(check, !this._started);
        };
    }

    hide() {
        this._ensureButton();

        this._button.style.display = "none";
    }

    setStart() {
        this._ensureButton();

        this._button.innerText = this._caption_start;
        this._started = true;
    }

    setStop() {
        this._ensureButton();

        this._button.innerText = this._caption_stop;
        this._started = false;
    }

    onButtonClick(cb) {
        this._callbacks.button_click = cb;
    }

    _ensureButton() {
        if (!this._button) {
            this._button = document.getElementById(BUTTON_ID);
        }
    }
}

export default LaunchBtnWrapper;