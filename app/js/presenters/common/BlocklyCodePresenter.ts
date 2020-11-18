import Presenter, {on} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/code/BlocklyView";
import CodeModel, {
    CodeCommandExecutedEvent,
    CodeLaunchedEvent,
    CodeTerminatedEvent
} from "../../models/common/CodeModel";
import {KeyUpEvent} from "../../core/models/KeyboardModel";
import ExerciseModel from "../../models/ExerciseModel";
import {FinishModeEvent} from "../../core/models/LayoutModel";

export default class BlocklyCodePresenter extends Presenter<BlocklyView> {
    private model: CodeModel;
    private exercise: ExerciseModel;

    protected ready() {
        this.model = this.getModel(CodeModel);
        this.exercise = this.getModel(ExerciseModel);
    }

    @on(FinishModeEvent)
    private onExerciseLoaded() {
        const exercise = this.exercise.getState();

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