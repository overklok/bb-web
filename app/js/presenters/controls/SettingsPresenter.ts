import {AlertType} from "../../core/views/modal/AlertView";
import {BoardStatusEvent} from "../../models/common/BoardModel";
import {ConnectionStatusEvent} from "../../models/common/ConnectionModel";
import SettingsModel, {SettingsChangedEvent} from "../../core/models/SettingsModel";
import Presenter, {on} from "../../core/base/Presenter";
import {SettingsView} from "../../views/controls/SettingsView";

export default class SettingsPresenter extends Presenter<SettingsView.SettingsView> {
    private settings: SettingsModel;

    getInitialProps(): any {
        this.settings = this.getModel(SettingsModel);

        const settings = this.settings.getState();

        return {
            config: settings.config,
            values: settings.values
        }
    }

    @on(SettingsView.SettingChangeEvent)
    handleChange(evt: SettingsView.SettingChangeEvent) {

    }
}