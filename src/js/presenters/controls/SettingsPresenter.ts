import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
import Presenter, {on} from "../../core/base/Presenter";
import {SettingsView} from "../../views/controls/SettingsView";
import defaultsDeep from "lodash/defaultsDeep";

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
        this.settings.setValue(evt.path, evt.value, true);
    }

    @on(SettingsChangeEvent)
    handleModelChange() {
        const state = this.settings.getState();
        const committed = defaultsDeep(state.uncommitted, state.values);

        this.setViewProps({
            values: committed
        })
    }
}