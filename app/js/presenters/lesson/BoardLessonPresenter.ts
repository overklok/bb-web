import Presenter, {on, restore} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel from "../../models/common/BoardModel";
import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
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
            readonly: !this.settings.getBoolean('general.is_demo'),
            verbose: this.settings.getBoolean('board.is_verbose'),
        };
    }

    @restore() @on(SettingsChangeEvent)
    private updateSettingsChange() {
        this.board.setPassive(this.settings.getBoolean('general.is_demo'));
        this.view.setVerbose(this.settings.getBoolean('board.is_verbose') as boolean);
    }

    @on(BoardView.ShortCircuitStartEvent)
    private showShortCircuitAlert() {
        const readonly = !(this.settings.getValue('general.is_demo') || !this.board.getState().readonly);

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
        const readonly = !this.settings.getValue('general.is_demo');

        if (readonly) {
            this.modal.hideAlert(AlertType.ShortCircuit);
        } else {
            if (this.sctoast == null) return;

            this.modal.hideToast(this.sctoast);
        }
    }
}
