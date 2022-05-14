import Presenter, {on, restore} from "../../core/base/Presenter";
import RichTextView from "../../views/common/RichTextView";
import LessonModel from "../../models/lesson/LessonModel";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/lesson/ProgressModel";

export default class TaskLessonPresenter extends Presenter<RichTextView.RichTextView> {
    private lesson: LessonModel;
    private progress: ProgressModel;

    public getInitialProps() {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);

        return {
            content: this.lesson.getState().description
        };
    }

    @restore() @on(ExerciseRunEvent)
    private onLessonLoaded() {
        const [misson_idx, exercise_idx] = this.progress.getOpenedExerciseIndex();
        const exercise = this.lesson.getExercise(misson_idx, exercise_idx);
        // const lesson = this.lesson.getState();

        let task_description = exercise.task_description || '';
            // task_description_alt = exercise.task_description_alt || task_description;

        // if (lesson.language == 'ru' && task_description_alt) {
        //     task_description = task_description_alt;
        // }

        this.setViewProps({
            content: task_description.trim()
        });
    }
}