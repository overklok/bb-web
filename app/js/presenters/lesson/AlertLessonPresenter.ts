import Presenter, {on} from "../../core/base/Presenter";
import AlertView, {AlertType} from "../../core/views/modal/AlertView";
import {BoardStatusEvent} from "../../models/common/BoardModel";
import {ConnectionStatusEvent} from "../../models/common/ConnectionModel";
import SettingsModel, {SettingsChangedEvent} from "../../models/lesson/SettingsModel";

export default class AlertLessonPresenter extends Presenter<AlertView> {
    private settings: SettingsModel;

    getInitialProps(): any {
        this.settings = this.getModel(SettingsModel);

        return {
            on_accept: this.setDemoMode.bind(this),
            on_close: this.closeAlert.bind(this),
        };
    }

    @on(BoardStatusEvent, ConnectionStatusEvent, SettingsChangedEvent)
    private showAlert(evt: BoardStatusEvent|ConnectionStatusEvent) {
        const {allow_demo, is_demo} = this.settings.getState();

        if (is_demo || evt.status === 'connected') {
            this.closeAlert();
            return;
        }

        this.setViewProps({
            type: allow_demo ? AlertType.BoardDisconnectedDemo : AlertType.BoardDisconnected,
        });
    }

    private closeAlert() {
        this.setViewProps({type: null});
    }

    private setDemoMode() {
        this.settings.setDemoMode(true);
    }
}