import Presenter, {on} from "../../core/base/Presenter";
import DebugDumpBoardView from "../../views/debug/DebugDumpBoardView";
import BoardModel from "../../models/common/BoardModel";
import LogModel from "../../models/common/LogModel";
import {ColorAccent, ToastPosition} from "../../core/helpers/styles";
import ModalModel from "../../core/models/ModalModel";
import {classicCopyTextToClipboard} from "../../utils/breadboard/core/extras/helpers";

export default class DebugDumpBoardPresenter extends Presenter<DebugDumpBoardView.DebugDumpBoardView> {
    private board: BoardModel;
    private modal: ModalModel;
    private log: LogModel;

    getInitialProps() {
        this.board = this.getModel(BoardModel);
        this.modal = this.getModel(ModalModel);
        this.log = this.getModel(LogModel);
    }

    @on(DebugDumpBoardView.DumpClickEvent)
    private async onLaunchClick() {
        const snapshots = this.board.getSnapshots();

        const toast = this.modal.showToast({
            title: `Пожалуйста, подождите`,
            content: `Запрос обрабатывается...`,
            status: ColorAccent.Warning,
            position: ToastPosition.TopRight,
        });

        const url = await this.log.registerSnapshots(snapshots);

        const copied: any = classicCopyTextToClipboard(url);

        this.modal.hideToast(toast);

        this.modal.showToast({
            title: `Снимок доски записан на сервере`,
            content: copied ? `URL был сохранён в буфер обмена` : `Скопируйте URL снимка в буфер обмена`,
            timeout: copied ? 2000: 10000,
            status: ColorAccent.Success,
            position: ToastPosition.TopRight,
            action: !copied && {
                title: 'Скопировать',
                callback: () => {
                    classicCopyTextToClipboard(url);
                }
            }
        });
    }
}