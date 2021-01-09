import Presenter, {on} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/common/BlocklyView";
import CodeModel, {
    CodeCommandExecutedEvent,
    CodeLaunchedEvent,
    CodeTerminatedEvent
} from "../../models/common/CodeModel";
import {KeyUpEvent} from "../../core/models/KeyboardModel";

export default class BlocklyCodePresenter extends Presenter<BlocklyView> {
    private model: CodeModel;

    public getInitialProps() {
        this.model = this.getModel(CodeModel);
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