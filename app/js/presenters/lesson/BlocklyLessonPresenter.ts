import Presenter, {on, restore} from "../../core/base/Presenter";
import BlocklyView from "../../views/common/BlocklyView";
import LessonModel from "../../models/LessonModel";
import ProgressModel, {ExerciseRunEvent} from "../../models/ProgressModel";
import {MountEvent} from "../../core/base/view/View";

export default class BlocklyLessonPresenter extends Presenter<BlocklyView> {
    private lesson: LessonModel;
    private progress: ProgressModel;

    public getInitialProps() {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);
    }

    @on(MountEvent)
    private onViewReady() {
        const [misson_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(misson_idx, exercise_idx);

        if (exercise.module_settings.code) {
            this.view.setBlockTypes(exercise.module_settings.code.block_types);
        }
    }

    @restore() @on(ExerciseRunEvent)
    private onExerciseLoaded() {
        const [misson_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(misson_idx, exercise_idx);

        if (exercise.module_settings.code) {
            this.view.setBlockTypes(exercise.module_settings.code.block_types);
        }
    }
}