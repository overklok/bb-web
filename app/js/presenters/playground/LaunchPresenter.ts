import Presenter, {on} from "../../core/base/Presenter";
import LaunchView, {LaunchClickEvent} from "../../views/controls/LaunchView";
import CodeModel, {CodeLaunchedEvent, CodeTerminatedEvent} from "../../models/common/CodeModel";
import ModalModel from "../../core/models/ModalModel";

export default class LaunchPresenter extends Presenter<LaunchView> {
    model: CodeModel;
    modal_model: ModalModel;

    public ready() {
        this.model = this.getModel(CodeModel);
        this.modal_model = this.getModel(ModalModel);
    }

    @on(LaunchClickEvent)
    protected onLaunchClick(evt: LaunchClickEvent) {
        if (evt.start) {
            if (this.model.isMainChainEmpty()) {

                this.modal_model.showModal({
                    dialog: {heading: 'Программа пуста'},
                    content: 'Чтобы запустить программу, необходимо добавить команды в поле редактора.'
                });
            }

            this.view.setLocked(true);
            this.model.executeMainChain();
        } else {
            this.view.setLocked(true);
            this.model.interruptMainChain();
        }
    }

    @on(CodeLaunchedEvent)
    protected onCodeLaunched() {
        this.view.setLaunching(true);
        this.view.setLocked(false);
    }

    @on(CodeTerminatedEvent)
    protected onCodeTerminated() {
        this.view.setLaunching(false);
        this.view.setLocked(false);
    }
}