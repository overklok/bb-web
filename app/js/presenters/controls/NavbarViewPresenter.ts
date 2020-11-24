import Presenter, {on} from "../../core/base/Presenter";
import {NavbarView} from "../../views/controls/NavbarView";
import LessonModel from "../../models/LessonModel";
import ProgressModel from "../../models/ProgressModel";
import {FinishModeEvent} from "../../core/models/LayoutModel";

export default class NavbarViewPresenter extends Presenter<NavbarView.NavbarView> {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    protected ready() {
        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);
    }

    @on(FinishModeEvent)
    private onLessonLoaded() {
        const lesson = this.model_lesson.getState();

        this.view.showMissionButtons(lesson.missions);
    }
}