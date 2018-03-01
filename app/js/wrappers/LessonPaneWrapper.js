import Wrapper from "../core/Wrapper";

import pager from "../~utils/js-pager/pager/pager.js";
import thm from "../~utils/js-pager/pager/pager.css";

const CLASSES = {
    PAGER: "pager"
};

class LessonPaneWrapper extends Wrapper {
    constructor(button_class) {
        super();

        this._button_class = button_class || "pager__item";

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

        this._container = document.createElement('div');
        this._container.setAttribute("class", CLASSES.PAGER);

        dom_node.appendChild(this._container);

        this.displayMissionButtons();
        pager();

        this._state.display = true;
    }

    registerMissions(missions) {
        for (let mission of missions) {
            this._missions.push({
                exercisesPassed: mission.exerciseIDX,
                exercisesAll: mission.exerciseCount
            })
        }
    }

    displayMissionButtons() {
        if (!this._container) {return false}

        let idx = 0;

        for (let mission of this._missions) {
            $(this._container).append(
                `<div class="pager__item" data-mission-idx=${idx}>
                    <div class="pager__link">
                        <div class="pager__link_progressor"></div>
                        <div class="num">${idx+1}</div>
                    </div>
                </div>`
            );

            $(`.pager__item[data-mission-idx=${idx}]`);

            idx++;
        }

        $("." + this._button_class).click((evt) => {
           let idx = $(evt.currentTarget).data('mission-idx');

           this._callbacks.buttonClick(idx);
        });
    }

    setMissionProgress(mission_idx, new_exercise_idx) {
        $(`.pager__item[data-mission-idx=${idx}] .pager__link .pager__link_progressor`).animate({height: "20%"})
    }

    onButtonClick(cb) {
        if (cb) {
            this._callbacks.buttonClick = cb;
        }
    }
}

export default LessonPaneWrapper;