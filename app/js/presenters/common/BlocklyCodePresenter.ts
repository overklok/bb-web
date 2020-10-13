import Presenter, {on} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/code/BlocklyView";
import CodeModel, {
    CodeCommandExecutedEvent,
    CodeLaunchedEvent,
    CodeTerminatedEvent
} from "../../models/common/CodeModel";

export default class BlocklyCodePresenter extends Presenter<BlocklyView> {
    private model: CodeModel;

    protected ready() {
        this.model = this.getModel(CodeModel);
    }

    @on(BlocklyCodeChangeEvent)
    private onCodeChange() {
        const chains = this.view.getChainset();
        this.model.setChainset(chains);
    }

    @on(CodeLaunchedEvent)
    private onCodeLaunched() {
        // TODO
    }

    @on(CodeCommandExecutedEvent)
    private onCommandExecuted(evt: CodeCommandExecutedEvent) {
        this.view.highlightBlock(evt.block_id);
    }

    @on(CodeTerminatedEvent)
    private onCodeTerminated() {
        this.view.highlightBlock(null);
    }
}