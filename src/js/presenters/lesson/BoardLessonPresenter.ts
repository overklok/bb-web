import Presenter, {on, restore} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel from "../../models/common/BoardModel";
import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
import ModalModel from "../../core/models/ModalModel";
import {AlertType} from "../../core/views/AlertView";
import {ColorAccent} from "../../core/helpers/styles";
import {ExerciseRunEvent} from "../../models/lesson/ProgressModel";

import i18next from 'i18next';
import { MountEvent } from "../../core/base/view/View";

export default class BoardLessonPresenter extends Presenter<BoardView.BoardView> {
    private board: BoardModel;
    private modal: ModalModel;
    private settings: SettingsModel;
    private sctoast: number;

    public getInitialProps() {
        this.modal = this.getModel(ModalModel);
        this.board = this.getModel(BoardModel);
        this.settings = this.getModel(SettingsModel);

        const board_state = this.board.getState();

        const is_demo = this.settings.getBoolean('general.is_demo');
        const ro_by_state = board_state.is_editable && board_state.is_passive;

        return {
            layout_name: board_state.layout_name,
            readonly: !is_demo && ro_by_state,
            verbose: this.settings.getBoolean('board.is_verbose'),
            debug: this.settings.getBoolean('board.is_debug'),
        }
    }

    @restore() @on(SettingsChangeEvent)
    private updateSettingsChange() {
        this.board.setPassive(this.settings.getBoolean('general.is_demo', true));
        this.view.setVerbose(this.settings.getBoolean('board.is_verbose', true));
        this.view.setDebug(this.settings.getBoolean('board.is_debug', true));
    }

    @on(ExerciseRunEvent)
    private prepareForExercise() {
        this.board.resetAnalog();
    }

    @on(BoardView.ShortCircuitStartEvent)
    private showShortCircuitAlert() {
        const readonly = !(this.settings.getValue('general.is_demo') || !this.board.getState().readonly);
        
        this.shortCircuitEndAlert();

        if (readonly) {
            this.modal.showAlert(AlertType.ShortCircuit);
        } else {
            this.sctoast = this.modal.showToast({
                title: i18next.t('main:alert.short_circuit.title'),
                content: i18next.t('main:alert.short_circuit.content'),
                status: ColorAccent.Danger,
            });
        }
    }

    @on(BoardView.ShortCircuitEndEvent)
    private shortCircuitEndAlert() {
        if (this.sctoast != null) {
            this.modal.hideToast(this.sctoast);
        } else {
            this.modal.hideAlert(AlertType.ShortCircuit);
        }
    }
}
