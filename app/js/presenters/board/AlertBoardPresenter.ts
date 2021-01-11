import Presenter, {on, restore} from "../../core/base/Presenter";
import AlertView from "../../core/views/modal/AlertView";
import BoardModel, {BoardStatusEvent} from "../../models/common/BoardModel";
import {ConnectionStatusEvent} from "../../models/common/ConnectionModel";

export default class AlertBoardPresenter extends Presenter<AlertView> {
    private board: BoardModel;
    getInitialProps(): any {
        this.board = this.getModel(BoardModel);

        return {};
    }

    @restore() @on(BoardStatusEvent, ConnectionStatusEvent)
    private showAlert(evt: BoardStatusEvent|ConnectionStatusEvent) {
        if (this.board.getState().allow_disconnected || evt.status === 'connected') {
            // remove alert if presented
            this.setViewProps({});
            return;
        }

        this.setViewProps({
            title: 'Board disconnected',
            content: 'board is disconnected now'
        });
    }
}