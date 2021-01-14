import {AlertType} from "../../core/views/modal/AlertView";
import {BoardStatusEvent} from "../../models/common/BoardModel";
import {ConnectionStatusEvent} from "../../models/common/ConnectionModel";
import SettingsModel, {SettingsChangedEvent} from "../../models/lesson/SettingsModel";
import AlertPresenter from "../../core/presenters/AlertPresenter";
import {on} from "../../core/base/Presenter";

export default class AlertLessonPresenter extends AlertPresenter {
    private settings: SettingsModel;

    getInitialProps(): any {
        super.getInitialProps();

        this.settings = this.getModel(SettingsModel);
    }

    @on(BoardStatusEvent, ConnectionStatusEvent, SettingsChangedEvent)
    protected showAlert(evt: BoardStatusEvent|ConnectionStatusEvent) {
        const {allow_demo, is_demo} = this.settings.getState();

        if (is_demo || evt.status === 'connected') {
            this.closeAlert(AlertType.BoardDisconnectedDemo);
            return;
        }

        this.pushAlert(
            allow_demo ? AlertType.BoardDisconnectedDemo : AlertType.BoardDisconnected,
            () => this.setDemoMode()
        );
    }

    private setDemoMode() {
        this.settings.setDemoMode(true);
    }
}