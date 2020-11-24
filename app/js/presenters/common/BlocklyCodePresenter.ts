import Presenter, {on} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/code/BlocklyView";
import CodeModel, {
    CodeCommandExecutedEvent,
    CodeLaunchedEvent,
    CodeTerminatedEvent
} from "../../models/common/CodeModel";
import {KeyUpEvent} from "../../core/models/KeyboardModel";
import LessonModel from "../../models/LessonModel";
import {FinishModeEvent} from "../../core/models/LayoutModel";
import ProgressModel from "../../models/ProgressModel";

export default class BlocklyCodePresenter extends Presenter<BlocklyView> {
    private model: CodeModel;
    private lesson: LessonModel;
    private progress: ProgressModel;

    protected ready() {
        this.model = this.getModel(CodeModel);
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

    @on(BlocklyCodeChangeEvent)
    private onCodeChange() {
        const chains = this.view.getChainset();
        this.model.setChainset(chains);
    }

    @on(CodeLaunchedEvent)
    private onCodeLaunched() {
        this.view.lock();
    }

    @on(CodeCommandExecutedEvent)
    private onCommandExecuted(evt: CodeCommandExecutedEvent) {
        this.view.highlightBlock(evt.block_id);
    }

    @on(CodeTerminatedEvent)
    private onCodeTerminated() {
        this.view.highlightBlock(null);
        this.view.unlock();
    }

    @on(KeyUpEvent)
    private onKeyUp(evt: KeyUpEvent) {
        this.model.executeButtonHandlerChain(evt.key);
    }
}