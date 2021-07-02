import {AlertType} from "../../core/views/modal/AlertView";
import BoardModel, {BoardStatusEvent} from "../../models/common/BoardModel";
import ConnectionModel, {ConnectionStatusEvent} from "../../models/common/ConnectionModel";
import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
import AlertPresenter from "../../core/presenters/AlertPresenter";
import {on} from "../../core/base/Presenter";

export default class AlertLessonPresenter extends AlertPresenter {
    private board: BoardModel;
    private settings: SettingsModel;
    private connection: ConnectionModel;

    getInitialProps(): any {
        super.getInitialProps();

        this.settings = this.getModel(SettingsModel);
        this.connection = this.getModel(ConnectionModel);
        this.board = this.getModel(BoardModel);
    }

    @on(BoardStatusEvent, ConnectionStatusEvent, SettingsChangeEvent)
    protected showAlert(evt: BoardStatusEvent | ConnectionStatusEvent | SettingsChangeEvent) {
        const is_connected = this.board.getState().is_connected && this.connection.getState().is_active;

        const allow_demo = !this.settings.isLocked('general.is_demo'),
              is_demo = this.settings.getBoolean('general.is_demo', true);

        if (allow_demo && (is_demo || is_connected)) {
            this.closeAlert(AlertType.BoardDisconnectedDemo);
            return;
        }

        this.pushAlert(
            allow_demo ? AlertType.BoardDisconnectedDemo : AlertType.BoardDisconnected,
            () => this.setDemoMode()
        );
    }

    private setDemoMode() {
        this.settings.setValue('general.is_demo', true, true);
    }
}
