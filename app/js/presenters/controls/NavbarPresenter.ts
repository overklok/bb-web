import Presenter, {on, restore} from "../../core/base/Presenter";
import {NavbarView} from "../../views/controls/NavbarView";
import LessonModel from "../../models/LessonModel";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";

export default class NavbarPresenter extends Presenter<NavbarView.NavbarView> {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    public ready() {
        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);
    }

    @restore() @on(LessonRunEvent)
    private onLessonLoaded() {
        console.log('oll');
        const lesson = this.model_lesson.getState();

        this.view.showMissionButtons(lesson.missions);
        this.model_progress.restartMission();
    }

    @on(ExerciseRunEvent)
    private onExerciseRun(evt: ExerciseRunEvent) {
        this.view.setMissionCurrent(evt.mission_idx);
        this.view.setExerciseCurrent(evt.exercise_idx);
    }

    @on(NavbarView.MissionSelectEvent)
    private async onMissionSelected(evt: NavbarView.MissionSelectEvent) {
        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(NavbarView.ExerciseSelectEvent)
    private async onExerciseSelected(evt: NavbarView.ExerciseSelectEvent) {
        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
        this.model_progress.switchExercise(evt.mission_idx, evt.exercise_idx);
    }
}