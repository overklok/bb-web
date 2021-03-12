import {AlertType} from "../../core/views/modal/AlertView";
import {BoardStatusEvent} from "../../models/common/BoardModel";
import {ConnectionStatusEvent} from "../../models/common/ConnectionModel";
import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
import AlertPresenter from "../../core/presenters/AlertPresenter";
import {on} from "../../core/base/Presenter";

export default class AlertLessonPresenter extends AlertPresenter {
    private settings: SettingsModel;

    getInitialProps(): any {
        super.getInitialProps();

        this.settings = this.getModel(SettingsModel);
    }

    @on(BoardStatusEvent, ConnectionStatusEvent, SettingsChangeEvent)
    protected showAlert(evt: BoardStatusEvent | ConnectionStatusEvent) {
        const allow_demo = !this.settings.isLocked('general.is_demo'),
              is_demo = this.settings.getState().values.general.is_demo;

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
        this.settings.setValue('general.is_demo', true);
    }
}