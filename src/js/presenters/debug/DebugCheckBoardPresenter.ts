/**
 * This module is used only for development purposes.
 * Some applications can optionally use this to visualize board circuit verification.
 */

import {AdminVerdictEvent} from "../../models/debug/DebugCheckModel";
import Presenter, { on } from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import ModalModel from "../../core/models/ModalModel";
import {ColorAccent} from "../../core/helpers/styles";

export default class DebugCheckBoardPresenter extends Presenter<BoardView.BoardView> {
    private modal: ModalModel;

    public getInitialProps() {
        this.modal = this.getModel(ModalModel);
    }

    @on(AdminVerdictEvent)
    private onVerdict(evt: AdminVerdictEvent) {
        this.modal.showToast({
            status: evt.verdict.is_passed ? ColorAccent.Success : ColorAccent.Danger,
            title: `Verification ${evt.verdict.is_passed ? 'succeeded' : 'failed'}`,
            content: evt.verdict.message,
            timeout: 5000,
        });

        if (evt.verdict.is_passed) return;

        const region = evt.verdict.region;

        this.view.highlightRegion(region, true);
    }
}