import Wrapper from "../core/Wrapper";

import thm from "../../css/launch-button.css";

const IDS = {
    EXECUTE_BTN: "execute-btn",
    CHECK_BTN: "check-btn",
    CALC_BTN: "calc-btn",
    CALC_INPUT: "calc-input",
};

const CLASSES = {
    TEST_PANE: "test-pane",
    LAUNCH_PANE: "launch-pane",
    LAUNCH_BTN: "launch-btn",
    CALC_INPUT_ERROR: "calc-input-error",
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
            },
            calc: {
                start: `<i class="fas fa-calculator"></i>&nbsp;<small>Рассчитать</small>`,
                stop: `<i class="fas fa-sync fa-spin fa-fw"></i>`,
            }
        };

        this._buttons = {
            check: undefined,
            execute: undefined,
            calc: undefined,
        };

        this._panes = {
            launch: undefined,
            test:   undefined,
        };

        this._started = {
            check: false,
            execute: false,
            calc: false,
        };

        this._panes_visibility = {
            launch: true,
            test: true,
        }
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

        this._buttons.calc.style.display = "inline";

        if (this._panes_visibility.launch) {
            this._panes.launch.style.display = "block"
        }

        if (this._panes_visibility.test) {
            this._panes.test.style.display = "block"
        }
    }

    hide() {
        this._buttons.execute.style.display = "none";
        this._buttons.check.style.display = "none";
        this._buttons.calc.style.display = "none";

        this._panes.launch.style.display = "none";
        this._panes.test.style.display = "none";
    }

    switchPaneVisibility(pane, on) {
        if (!(pane in this._panes)) {
            throw new RangeError(`There is no "${pane}" pane`);
        }

        if (on) {
            this._panes_visibility[pane] = true;
            if (this._panes[pane]) {this._panes[pane].style.display = "block"}

        } else {
            this._panes_visibility[pane] = false;
            if (this._panes[pane]) {this._panes[pane].style.display = "none"}
        }
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
        if (!cb) {cb = () => {}}

        this._callbacks.button_click = cb;
    }

    _ensureButtons(dom_node) {
        this._panes = {
            launch: document.createElement("div"),
            test: document.createElement("div"),
        };

        this._panes.launch.classList.add(CLASSES.LAUNCH_PANE);
        this._panes.test.classList.add(CLASSES.TEST_PANE);

        this._buttons = {
            execute: document.createElement("div"),
            check: document.createElement("div"),
            calc: document.createElement("div"),
        };

        let calc_input = document.createElement("input");
        calc_input.id = IDS.CALC_INPUT;
        calc_input.placeholder = 0;

        this._buttons.execute.id = IDS.EXECUTE_BTN;
        this._buttons.check.id = IDS.CHECK_BTN;
        this._buttons.calc.id = IDS.CALC_BTN;

        this._buttons.execute.classList.add(CLASSES.LAUNCH_BTN);
        this._buttons.check.classList.add(CLASSES.LAUNCH_BTN);

        this._panes.launch.appendChild(this._buttons.execute);
        this._panes.launch.appendChild(this._buttons.check);

        this._panes.test.appendChild(calc_input);
        this._panes.test.appendChild(this._buttons.calc);

        dom_node.appendChild(this._panes.launch);
        dom_node.appendChild(this._panes.test);

        this._buttons.execute.onclick = (evt) => {
            this._callbacks.button_click('execute', !this._started.execute);
        };

        this._buttons.check.onclick = (evt) => {
            this._callbacks.button_click('check', !this._started.check);
        };

        this._buttons.calc.onclick = (evt) => {
            let data = Number(calc_input.value);

            if (isNaN(data) || data == null) {
                this._buttons.calc.classList.add(CLASSES.CALC_INPUT_ERROR);
                calc_input.classList.add(CLASSES.CALC_INPUT_ERROR);

                setTimeout(() => {
                    this._buttons.calc.classList.remove(CLASSES.CALC_INPUT_ERROR);
                    calc_input.classList.remove(CLASSES.CALC_INPUT_ERROR);
                }, 1000);
            } else {
                this._callbacks.button_click('calc', !this._started.calc, data);
            }
        };
    }
}