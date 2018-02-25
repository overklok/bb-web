import Wrapper from "../core/Wrapper";

class LessonPaneWrapper extends Wrapper {
    constructor(button_class) {
        super();

        this._button_class = button_class || "mission-btn";

        this._callbacks = {
            buttonClick: idx => {console.warn("buttonClick dummy callback fired, idx", idx)}
        };

        this._missions = [];
    }

    registerMissions(missions, container) {
        for (let mission of missions) {
            this._missions.push({
                exercisesPassed: null,
                exercisesAll: null
            })
        }

        this._displayMissionButtons(container);
    }

    onButtonClick(cb) {
        if (cb) {
            this._callbacks.buttonClick = cb;
        }
    }

    _displayMissionButtons(container) {
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
}

export default LessonPaneWrapper;