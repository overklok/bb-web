import {AlertType} from "~/js/core/views/modal/AlertView";
import BoardModel, {BoardStatusEvent} from "~/js/models/common/BoardModel";
import ConnectionModel, {ConnectionStatusEvent} from "~/js/models/common/ConnectionModel";
import SettingsModel, {SettingsChangeEvent} from "~/js/core/models/SettingsModel";
import AlertPresenter from "~/js/core/presenters/AlertPresenter";
import {on} from "~/js/core/base/Presenter";
import ProgressModel, { ExerciseRunEvent, LessonRunEvent } from "~/js/models/lesson/ProgressModel";

export default class AlertLessonPresenter extends AlertPresenter {
    private board: BoardModel;
    private settings: SettingsModel;
    private connection: ConnectionModel;
    private progress: ProgressModel;

    getInitialProps(): any {
        super.getInitialProps();

        this.settings = this.getModel(SettingsModel);
        this.connection = this.getModel(ConnectionModel);
        this.board = this.getModel(BoardModel);
        this.progress = this.getModel(ProgressModel);
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

        if (!allow_demo && (is_demo || is_connected)) {
            this.closeAlert(AlertType.BoardDisconnected);
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
