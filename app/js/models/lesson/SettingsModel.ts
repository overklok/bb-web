import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import {ModelEvent} from "../../core/base/Event";

interface Settings {
    is_demo: boolean;
    allow_demo: boolean;
}

export default class SettingsModel extends Model<Settings, DummyDatasource> {
    static alias = 'settings';

    protected defaultState: Settings = {
        is_demo: false,
        allow_demo: true,
    };

    setDemoMode(is_enabled: boolean) {
        if (this.state.allow_demo == false && is_enabled == true) {
            throw new Error("Demo mode is not allowed");
        }

        this.setState({is_demo: is_enabled});

        this.emit(new SettingsChangedEvent());
    }
}

export class SettingsChangedEvent extends ModelEvent<SettingsChangedEvent> {}