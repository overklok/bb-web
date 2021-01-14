import Presenter, {on} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel from "../../models/common/BoardModel";
import SettingsModel, {SettingsChangedEvent} from "../../models/lesson/SettingsModel";
import ModalModel from "../../core/models/ModalModel";
import {AlertType} from "../../core/views/modal/AlertView";
import {ColorAccent} from "../../core/helpers/styles";

export default class BoardLessonPresenter extends Presenter<BoardView.BoardView> {
    private board: BoardModel;
    private modal: ModalModel;
    private settings: SettingsModel;
    private sctoast: number;

    public getInitialProps() {
        this.modal = this.getModel(ModalModel);
        this.board = this.getModel(BoardModel);
        this.settings = this.getModel(SettingsModel);

        return {
            readonly: !this.settings.getState().is_demo
        };
    }

    @on(SettingsChangedEvent)
    private updateSettingsChange() {
        this.view.setReadOnly(!this.settings.getState().is_demo);
    }

    @on(BoardView.ShortCircuitStartEvent)
    private showShortCircuitAlert() {
        const readonly = !this.settings.getState().is_demo;

        if (readonly) {
            this.modal.showAlert(AlertType.ShortCircuit);
        } else {
            this.sctoast = this.modal.showToast({
                title: 'Короткое замыкание!',
                content: 'Разомкните цепь, чтобы устранить короткое замыкание.',
                status: ColorAccent.Danger,
            });
        }
    }

    @on(BoardView.ShortCircuitEndEvent)
    private shortCircuitEndEvent() {
        const readonly = !this.settings.getState().is_demo;

        if (readonly) {
            this.modal.hideAlert(AlertType.ShortCircuit);
        } else {
            if (this.sctoast == null) return;

            this.modal.hideToast(this.sctoast);
        }
    }
}