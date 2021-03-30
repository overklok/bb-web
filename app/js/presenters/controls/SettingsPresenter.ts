import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
import Presenter, {on} from "../../core/base/Presenter";
import {SettingsView} from "../../views/controls/SettingsView";

export default class SettingsPresenter extends Presenter<SettingsView.SettingsView> {
    private settings: SettingsModel;
    private saved: {};

    getInitialProps(): any {
        this.settings = this.getModel(SettingsModel);

        const settings = this.settings.getState();

        this.saved = settings.values;

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

    // @on()

    // @on(SettingsView.RollbackEvent)
    // rollbackChanges(evt: SettingsView.RollbackEvent) {
    //     if (!evt.hard) {
    //         // TODO: show alert, rollback and close if accepted, close the modal if declined
    //     }
    // }
}