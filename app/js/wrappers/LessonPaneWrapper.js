import Wrapper from "../core/Wrapper";

import js from "../~utils/js-pager/pager/pager.js";
import thm from "../~utils/js-pager/pager/pager.css";

const CLASSES = {
    PAGER: "pager"
};

class LessonPaneWrapper extends Wrapper {
    constructor(button_class) {
        super();

        this._button_class = button_class || "mission-btn";

        this._callbacks = {
            buttonClick: idx => {console.warn("buttonClick dummy callback fired, idx", idx)}
        };

        this._state = {
            display: false
        };

        this._missions = [];

        this._container = undefined;
    }

    inject(dom_node) {
        if (!dom_node) {return false}

        console.log("INJINJ", dom_node)

        this._container = document.createElement('div');
        this._container.setAttribute("class", CLASSES.PAGER);

        dom_node.appendChild(this._container);

        this._state.display = true;
    }

    registerMissions(missions) {
        for (let mission of missions) {
            this._missions.push({
                exercisesPassed: null,
                exercisesAll: null
            })
        }
    }

    displayMissionButtons(container) {
        let idx = 0;

        for (let mission of this._missions) {
            $(container).append(
                "<a href='#' class='" + this._button_class + "' data-mission-idx='" + idx + "'>MSN #" + (idx++) + "</a>"
            );
        }

        $("." + this._button_class).click((evt) => {
           let idx = $(evt.currentTarget).data('mission-idx');

           this._callbacks.buttonClick(idx);
        });
    }

    onButtonClick(cb) {
        if (cb) {
            this._callbacks.buttonClick = cb;
        }
    }
}

export default LessonPaneWrapper;