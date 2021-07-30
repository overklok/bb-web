/**
 * This module is used only for development purposes.
 * Some applications can optionally use this to visualize board circuit verification.
 */

import {AdminVerdictEvent} from "../../models/debug/DebugCheckModel";
import Presenter, { on } from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import ModalModel from "../../core/models/ModalModel";
import {ColorAccent} from "../../core/helpers/styles";
import { ValidationVerdictStatus } from "../../models/lesson/ProgressModel";

export default class DebugCheckBoardPresenter extends Presenter<BoardView.BoardView> {
    private modal: ModalModel;

    public getInitialProps() {
        this.modal = this.getModel(ModalModel);
    }

    @on(AdminVerdictEvent)
    private onVerdict(evt: AdminVerdictEvent) {
        if (evt.verdict.status === ValidationVerdictStatus.Success) {
            this.modal.showToast({
                status: ColorAccent.Success,
                title: `Verification succeeded`,
                content: evt.verdict.message,
                timeout: 5000,
            });
        }

        if (evt.verdict.status === ValidationVerdictStatus.Error || evt.verdict.status === ValidationVerdictStatus.Fail) {
            this.modal.showToast({
                status: ColorAccent.Danger,
                title: `Verification failed`,
                content: evt.verdict.message,
                timeout: 5000,
            });
        }

        if (evt.verdict.status === ValidationVerdictStatus.Undefined) {
            this.modal.showToast({
                status: ColorAccent.Warning,
                title: `Verification result is undefined`,
                content: evt.verdict.message,
                timeout: 5000,
            });
        }

        if (evt.verdict.status === ValidationVerdictStatus.Success) return;

        if (evt.verdict.details && evt.verdict.details.hasOwnProperty('region')) {
            this.view.highlightRegion(evt.verdict.details['region'], true);
        }
    }
}