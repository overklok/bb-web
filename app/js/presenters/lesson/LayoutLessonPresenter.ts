import LayoutPresenterCore from "../../core/presenters/LayoutPresenter";
import LessonModel from "../../models/LessonModel";
import ProgressModel from "../../models/ProgressModel";
import {LessonRouteEvent, MissionRouteEvent} from "../../routers/MainRouter";
import {on, restore} from "../../core/base/Presenter";

export default class LayoutLessonPresenter extends LayoutPresenterCore {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    public getInitialProps() {
        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);

        return super.getInitialProps();
    }

    @restore() @on(LessonRouteEvent, MissionRouteEvent)
    public async runExercise(evt: LessonRouteEvent|MissionRouteEvent) {
        const lesson = await this.model_lesson.read({lesson_id: evt.lesson_id});
        this.model_progress.loadLesson(lesson);

        const [mission_idx, exercise_idx] = this.model_progress.getExerciseCurrent();
        const exercise = this.model_lesson.getExercise(mission_idx, exercise_idx);
        await this.model_layout.setMode(exercise.layout_mode);

        if (evt instanceof MissionRouteEvent) {
            this.model_progress.switchExercise(evt.mission_id);
        }
    }
}