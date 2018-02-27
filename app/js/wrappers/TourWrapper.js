import Wrapper from "../core/Wrapper"

import base from "intro.js/introjs.css";
// import thm from "intro.js/themes/introjs-flattener.css";
import thm from "../../css/intro.css";

let introJS = require('intro.js').introJs;
// window.introJS = introJS;

const MODES = {
    INTRO: "intro",
    DIALOG: "dialog",
    SUCCESS: "success",
    ERROR: "error"
};

const DIALOG_DEFAULT = "Вы уверены?";

class TourWrapper extends Wrapper {
    constructor(mode, steps) {
        super();

        this._introJS = introJS();
        this._mode = mode;

        let options = this._getOptions(mode);

        if (this._mode === MODES.DIALOG) {
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

            if (this._mode !== MODES.DIALOG && this._introJS._introItems.length > 1) {
                $('.introjs-skipbutton').hide();
            }

            this._introJS.onafterchange(function(){
                if (self._mode === MODES.DIALOG) {
                    reject(); rejected = true;
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
                    this._mode === MODES.DIALOG ? resolve(true) : resolve(false);
                }
            });

            this._introJS.oncomplete(() => {
                if (!rejected) {
                    resolve(true);
                }
            })
        });
    }

    _getOptions(mode) {
        let options = {
            doneLabel: "ОК",
            nextLabel: "Дальше",
            prevLabel: "Назад",
            skipLabel: "Пропустить",
        };

        switch (mode) {
            case MODES.SUCCESS: {
                break;
            }
            case MODES.ERROR: {
                break;
            }
            case MODES.DIALOG: {
                options.skipLabel = "Да";
                options.nextLabel = "Нет";
                options.showBullets = false;
                options.hidePrev = true;
                options.exitOnOverlayClick = false;
                options.showStepNumbers = false;
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

export default TourWrapper;
