import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
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
        console.log(evt.path, evt.value);
        this.settings.setValue(evt.path, evt.value);
    }

    @on(SettingsChangeEvent)
    handleModelChange() {
        console.log(this.settings.getState().values);
        this.setViewProps({
            values: this.settings.getState().values
        })
    }
}