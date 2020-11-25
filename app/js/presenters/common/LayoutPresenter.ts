import LayoutPresenterCore from "../../core/presenters/LayoutPresenter";
import LessonModel from "../../models/LessonModel";
import ProgressModel from "../../models/ProgressModel";
import {LessonRouteEvent} from "../../routers/MainRouter";
import {on, restore} from "../../core/base/Presenter";

export default class LayoutPresenter extends LayoutPresenterCore {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    protected ready() {
        super.ready();

        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);
    }

    @restore() @on(LessonRouteEvent)
    public async runExercise(evt: LessonRouteEvent) {
        const lesson = await this.model_lesson.read({lesson_id: evt.lesson_id});
        this.model_progress.loadLesson(lesson);

        const [mission_idx, exercise_idx] = this.model_progress.getExerciseCurrent();
        const exercise = this.model_lesson.getExercise(mission_idx, exercise_idx);
        this.model_layout.setMode(exercise.layout_mode);
    }
}