import Wrapper from "../core/Wrapper";

import pager from "../~utils/js-pager/pager/pager.js";
import thm from "../~utils/js-pager/pager/pager.css";

const CLASSES = {
    PAGER: "pager",
    ITEM_LEADING: "pager__item_leading"
};

class LessonPaneWrapper extends Wrapper {
    constructor(button_class) {
        super();

        this._button_class = button_class || "pager__item";

        this._callbacks = {
            buttonClick: idx => {console.warn("buttonClick dummy callback fired, idx", idx)}
        };

        this._state = {
            display: false,
            missionIDX: undefined,
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

        let _extra_class = "";

        if (typeof this._state.missionIDX !== "undefined") {
            _extra_class = CLASSES.ITEM_LEADING;
        }

        let idx = 0;

        for (let mission of this._missions) {
            let extra_class = (idx === this._state.missionIDX) ? _extra_class : "";

            $(this._container).append(
                `<div class="pager__item ${extra_class}" data-mission-idx=${idx}>
                    <div class="pager__link">
                        <div class="pager__link_progressor"></div>
                        <div class="pager__link_num">${idx+1}</div>
                    </div>
                </div>`
            );


            // $(`.pager__item[data-mission-idx=${idx}]`);

            idx++;
        }

        $("." + this._button_class).click((evt) => {
           let idx = $(evt.currentTarget).data('mission-idx');

           this._callbacks.buttonClick(idx);
        });
    }

    setMissionCurrent(mission_idx) {
        if (!this._container) {
            if (typeof mission_idx !== "undefined") {
                this._state.missionIDX = mission_idx;
            }

            return false
        }

        if (typeof this._state.missionIDX !== "undefined") {
            $(`.pager__item[data-mission-idx=${this._state.missionIDX}]`).removeClass(CLASSES.ITEM_LEADING);
        }

        if (typeof mission_idx !== "undefined") {
            $(`.pager__item[data-mission-idx=${mission_idx}]`).addClass(CLASSES.ITEM_LEADING);
            this._state.missionIDX = mission_idx;
        }

        console.log(this._state.missionIDX, mission_idx);
    }

    setMissionProgress(mission_idx, new_exercise_idx, exercise_count) {
        if (!this._container) {return false}

        let percent = (new_exercise_idx + 1) / exercise_count * 100;

        $(`.pager__item[data-mission-idx=${mission_idx}] .pager__link .pager__link_progressor`).animate(
            {height: `${percent}%`},
            400,
            "easeInOutCirc"
        )
    }

    onButtonClick(cb) {
        if (cb) {
            this._callbacks.buttonClick = cb;
        }
    }
}

export default LessonPaneWrapper;