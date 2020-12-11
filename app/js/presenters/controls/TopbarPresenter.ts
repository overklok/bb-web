import Presenter, {on, restore} from "../../core/base/Presenter";
import {TopbarView} from "../../views/controls/TopbarView";
import LessonModel from "../../models/LessonModel";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";
import {NavbarView} from "../../views/controls/NavbarView";

export default class TopbarPresenter extends Presenter<TopbarView.TopbarView> {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    public getInitialProps(): TopbarView.Props {
        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);

        return {
            missions: this.model_lesson.getState().missions,
            progress: this.model_progress.getState()
        }
    }

    @restore() @on(LessonRunEvent)
    private onLessonLoaded() {
        this.setViewProps({
            missions: this.model_lesson.getState().missions,
            progress: this.model_progress.getState()
        });
    }

    @on(ExerciseRunEvent)
    private onExerciseRun(evt: ExerciseRunEvent) {
        this.setViewProps({
            progress: this.model_progress.getState()
        });
    }

    @on(TopbarView.MissionSelectEvent)
    private async onMissionSelected(evt: NavbarView.MissionSelectEvent) {
        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.ExerciseSelectEvent)
    private async onExerciseSelected(evt: NavbarView.ExerciseSelectEvent) {
        const lesson_id = this.model_progress.getState().lesson_id;
        this.model_progress.preferExercise(evt.exercise_idx);
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }
}