import Presenter, {on} from "../../core/base/Presenter";
import BlocklyView from "../../views/code/BlocklyView";
import LessonModel from "../../models/LessonModel";
import {FinishModeEvent} from "../../core/models/LayoutModel";
import ProgressModel from "../../models/ProgressModel";

export default class BlocklyCodePresenter extends Presenter<BlocklyView> {
    private lesson: LessonModel;
    private progress: ProgressModel;

    protected ready() {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);
    }

    @on(FinishModeEvent)
    private onExerciseLoaded() {
        const [misson_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(misson_idx, exercise_idx);

        if (exercise.module_settings.code) {
            this.view.setBlockTypes(exercise.module_settings.code.block_types);
        }
    }
}