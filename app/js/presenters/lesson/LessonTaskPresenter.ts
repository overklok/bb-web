import Presenter, {on, restore} from "../../core/base/Presenter";
import RichTextView from "../../views/common/RichTextView";
import LessonModel from "../../models/LessonModel";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";

export default class LessonTaskPresenter extends Presenter<RichTextView.RichTextView> {
    private lesson: LessonModel;
    private progress: ProgressModel;

    public getInitialProps() {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);

        return {
            content: this.lesson.getState().description
        };
    }

    @restore() @on(LessonRunEvent, ExerciseRunEvent)
    private onLessonLoaded() {
        const [misson_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(misson_idx, exercise_idx);

        this.setViewProps({
            content: exercise.task_description
        });
    }
}