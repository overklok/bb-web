import Wrapper from "../core/Wrapper"

import base from "intro.js/introjs.css";
// import thm from "intro.js/themes/introjs-flattener.css";
import thm from "../../css/intro.css";

let introJS = require('intro.js');
// window.introJS = introJS;

const CLASS_NAMES = {
    SUCCESS: "introjs-tooltip-success",
    ERROR: "introjs-tooltip-error"
};

const MODES = {
    INTRO: "intro",
    ERROR: "error",
    DIALOG: "dialog",
    SUCCESS: "success"
};

const DIALOG_MODES = ["dialog", "success"];

const DIALOG_DEFAULT = "Упражнение пройдено!";

export default class TourWrapper extends Wrapper {
    constructor(mode, steps) {
        super();

        this._introJS = introJS();
        this._mode = mode;

        let options = this._getOptions(mode);

        if (DIALOG_MODES.indexOf(this._mode) >= 0) {
            options.steps = [{intro: steps || DIALOG_DEFAULT}, {}]
        } else {
            if (steps) {
                options.steps = steps;
            }
        }

        this._introJS.setOptions(options);
    }

    start() {
        return new Promise((resolve, reject) => {
            let self = this;
            let rejected = false;

            this._introJS.start();

            if (DIALOG_MODES.indexOf(this._mode) === -1 && this._introJS._introItems.length > 1) {
                $('.introjs-skipbutton').hide();
            }

            this._setStyles();

            this._introJS.onafterchange(function () {
                if (DIALOG_MODES.indexOf(self._mode) >= 0) {
                    reject();
                    rejected = true;
                    this.exit(true);
                }

                if (this._introItems.length - 1 === this._currentStep || this._introItems.length === 1) {
                    $('.introjs-skipbutton').show();
                } else {
                    $('.introjs-skipbutton').hide();
                }
            });

            this._introJS.onexit(() => {
                if (!rejected) {
                    DIALOG_MODES.indexOf(this._mode) >= 0 ? resolve(true) : resolve(false);
                }
            });

            this._introJS.oncomplete(() => {
                if (!rejected) {
                    resolve(true);
                }
            })
        });
    }

    _setStyles() {
        switch (this._mode) {
            case MODES.SUCCESS: {
                $('.introjs-tooltip').addClass(CLASS_NAMES.SUCCESS);
                break;
            }
            case MODES.ERROR: {
                $('.introjs-tooltip').addClass(CLASS_NAMES.ERROR);
                break;
            }
            default: {

                break;
            }
        }

    }

    _getOptions(mode) {
        let options = {
            doneLabel: "ОК",
            nextLabel: "Дальше",
            prevLabel: "Назад",
            skipLabel: "Пропустить",
            showStepNumbers: false,
        };

        switch (mode) {
            case MODES.DIALOG: {
                options.skipLabel = "Да";
                options.nextLabel = "Нет";
                options.showBullets = false;
                options.hidePrev = true;
                options.exitOnOverlayClick = false;
                break;
            }
            case MODES.SUCCESS: {
                options.skipLabel = "Перейти";
                options.nextLabel = "Остаться";
                options.showBullets = false;
                options.hidePrev = true;
                options.exitOnOverlayClick = false;
                break;
            }
            case MODES.ERROR: {
                options.doneLabel = "ОК";
                options.hidePrev = true;
                options.showBullets = false;
                break;
            }
            case MODES.INTRO:
            default: {
                options.doneLabel = "Приступить";
                options.hidePrev = true;
                options.hideNext = true;
                options.exitOnOverlayClick = false;
            }
        }

        return options;
    }
}