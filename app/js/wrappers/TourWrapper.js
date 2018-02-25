import Wrapper from "../core/Wrapper"

import base from "intro.js/introjs.css";
// import thm from "intro.js/themes/introjs-flattener.css";
import thm from "../../css/intro.css";

let introJS = require('intro.js').introJs;
// window.introJS = introJS;

const MODES = {
    INTRO: "intro",
    SUCCESS: "success",
    ERROR: "error"
};

class TourWrapper extends Wrapper {
    constructor(mode, steps) {
        super();

        this._introJS = introJS();
        this._mode = mode;

        let options = this._getOptions(mode);

        if (steps) {
            options.steps = steps;
        } else {
            options.steps = [
                {
                    intro: "Step #1"
                }
            ]
        }

        this._introJS.setOptions(options);
    }

    start() {
        return new Promise(resolve => {
            this._introJS.start();

            if (this._introJS._introItems.length > 1) {
                $('.introjs-skipbutton').hide();
            }

            this._introJS.onafterchange(function(){
                if (this._introItems.length - 1 === this._currentStep || this._introItems.length === 1) {
                    $('.introjs-skipbutton').show();
                } else {
                    $('.introjs-skipbutton').hide();
                }
            });

            this._introJS.onexit(() => {resolve()});
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
