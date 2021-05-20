import Presenter, {on, restore} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/common/BlocklyView";
import LessonModel from "../../models/lesson/LessonModel";
import ProgressModel, {ExerciseRunEvent, MissionRunEvent} from "../../models/ProgressModel";
import {MountEvent} from "../../core/base/view/View";

export default class BlocklyLessonPresenter extends Presenter<BlocklyView> {
    private lesson: LessonModel;
    private progress: ProgressModel;

    public getInitialProps() {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);
    }

    @restore() @on(MountEvent, ExerciseRunEvent)
    private loadBlockTypes(evt: ExerciseRunEvent) {
        const [mission_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(mission_idx, exercise_idx);

        if (exercise.module_settings.code) {
            this.view.setBlockTypes(exercise.module_settings.code.block_types);
        }
    }

    @on(BlocklyCodeChangeEvent)
    private saveMissionCode() {
        const code = this.view.getCodeTree();

        this.progress.setMissionData({code});
    }

    @restore() @on(MissionRunEvent)
    private loadMissionCode(evt: MissionRunEvent) {
        this.view.setCodeTree(evt.data ? evt.data.code : null);
    }
}