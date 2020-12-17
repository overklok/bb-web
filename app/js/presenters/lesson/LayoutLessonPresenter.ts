import LayoutPresenterCore from "../../core/presenters/LayoutPresenter";
import LessonModel from "../../models/LessonModel";
import ProgressModel, {ExerciseRunEvent} from "../../models/ProgressModel";
import {LessonRouteEvent, MissionRouteEvent} from "../../routers/MainRouter";
import {on, restore} from "../../core/base/Presenter";

export default class LayoutLessonPresenter extends LayoutPresenterCore {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    public getInitialProps() {
        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);

        document.title = `Tapanda`;

        return super.getInitialProps();
    }

    @restore() @on(LessonRouteEvent, MissionRouteEvent)
    protected async runMission(evt: LessonRouteEvent|MissionRouteEvent) {
        const lesson = await this.model_lesson.read({lesson_id: evt.lesson_id});
        this.model_progress.loadLesson(lesson);

        if (evt instanceof MissionRouteEvent) {
            this.model_progress.switchMission(evt.mission_id);
        } else {
            this.model_progress.switchMission();
        }

        const [mission_idx, exercise_idx] = this.model_progress.getExerciseCurrent();
        const exercise = this.model_lesson.getExercise(mission_idx, exercise_idx);
        await this.model_layout.setMode(exercise.layout_mode);

        const progress = this.model_progress.getState();

        if (evt instanceof MissionRouteEvent) {
            // Prevent insufficient redirect (if idx change is not confirmed, move to current mission)
            // We need to keep URL actual if mission jump was rejected by ProgressModel.
            if (progress.mission_idx !== evt.mission_id) {
                this.forward(
                    'mission',
                    [progress.lesson_id, progress.mission_idx],
                    true
                );
                return;
            }
        }
    }

    @restore() @on(ExerciseRunEvent)
    protected updateWindowTitle() {
        const progress = this.model_progress.getState();
        const [mission_idx, exercise_idx] = this.model_progress.getExerciseCurrent();

        document.title = `Tapanda | Lesson ${progress.lesson_id}, Mission ${mission_idx}`;
    }
}