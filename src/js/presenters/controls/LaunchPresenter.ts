import Presenter, {on} from "../../core/base/Presenter";
import LaunchView from "../../views/controls/LaunchView";
import CodeModel, {CodeLaunchedEvent, CodeTerminatedEvent} from "../../models/common/CodeModel";
import ModalModel from "../../core/models/ModalModel";

export default class LaunchPresenter extends Presenter<LaunchView.LaunchView> {
    code: CodeModel;
    modal: ModalModel;

    public getInitialProps() {
        this.code = this.getModel(CodeModel);
        this.modal = this.getModel(ModalModel);

        return {mode: LaunchView.Mode.ExecuteOnly};
    }

    @on(LaunchView.ExecuteClickEvent)
    protected onLaunchClick(evt: LaunchView.ExecuteClickEvent) {
        if (evt.start) {
            if (this.code.isMainChainEmpty()) {
                this.modal.showModal({
                    is_closable: true,
                    dialog: {heading: "main:lesson.modal.program_empty.heading"},
                    content: "main:lesson.modal.program_empty.content"
                });
            }

            this.setViewProps({is_executing: LaunchView.ButtonState.Busy});
            this.code.executeMainChain();
        } else {
            this.setViewProps({is_executing: LaunchView.ButtonState.Busy});
            this.code.interruptMainChain();
        }
    }

    @on(CodeLaunchedEvent)
    protected onCodeLaunched() {
        this.setViewProps({is_executing: LaunchView.ButtonState.Running});
    }

    @on(CodeTerminatedEvent)
    protected onCodeTerminated() {
        this.setViewProps({is_executing: LaunchView.ButtonState.Idle});
    }
}