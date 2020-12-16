import Presenter, {on, restore} from "../../core/base/Presenter";
import TopbarView from "../../views/controls/TopbarView";
import LessonModel from "../../models/LessonModel";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";

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
    private updateLessonData() {
        this.setViewProps({
            missions: this.model_lesson.getState().missions,
            progress: this.model_progress.getState()
        });
    }

    @on(ExerciseRunEvent)
    private updateProgress(evt: ExerciseRunEvent) {
        this.setViewProps({
            progress: this.model_progress.getState()
        });
    }

    @on(TopbarView.MissionForwardEvent)
    private async forwardMission(evt: TopbarView.MissionForwardEvent) {
        this.model_progress.fastForwardMission();

        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.MissionRestartEvent)
    private async restartMission(evt: TopbarView.MissionRestartEvent) {
        this.model_progress.restartMission();

        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.MissionSelectEvent)
    private async selectMission(evt: TopbarView.MissionSelectEvent) {
        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.ExerciseSelectEvent)
    private async selectExercise(evt: TopbarView.ExerciseSelectEvent) {
        this.model_progress.switchExercise(evt.mission_idx, evt.exercise_idx);

        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.MenuItemEvent)
    private openLessonMenu(evt: TopbarView.MenuItemEvent) {
        switch (evt.item) {
            case "lessons": this.forward('index', []); break;
        }
    }
}