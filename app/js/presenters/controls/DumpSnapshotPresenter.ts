import Presenter, {on} from "../../core/base/Presenter";
import DumpSnapshotView from "../../views/controls/DumpSnapshotView";
import BoardModel from "../../models/common/BoardModel";
import LogModel from "../../models/common/LogModel";
import {ColorAccent, ToastPosition} from "../../core/helpers/styles";
import ModalModel from "../../core/models/ModalModel";
import {copyTextToClipboard} from "../../utils/breadboard/core/extras/helpers";

export default class DumpSnapshotPresenter extends Presenter<DumpSnapshotView.DumpSnapshotView> {
    private board: BoardModel;
    private modal: ModalModel;
    private log: LogModel;
    private counter: number;

    getInitialProps() {
        this.board = this.getModel(BoardModel);
        this.modal = this.getModel(ModalModel);
        this.log = this.getModel(LogModel);
    }

    @on(DumpSnapshotView.DumpClickEvent)
    protected async onLaunchClick() {
        const snapshots = this.board.getSnapshots();
        const url = await this.log.registerSnapshots(snapshots);

        copyTextToClipboard(url);

        this.modal.showToast({
            title: `Дамп доски записан на сервере`,
            content: `URL был сохранён в буфер обмена`,
            timeout: 2000,
            status: ColorAccent.Success,
            position: this.counter % 2 ? ToastPosition.TopLeft : ToastPosition.TopRight
        });
    }
}