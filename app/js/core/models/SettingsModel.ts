import DummyDatasource from "../base/model/datasources/DummyDatasource";
import Model from "../base/model/Model";
import {ModelEvent} from "../base/Event";
import {Setting, SettingsConfig, SettingsValues, SettingValue} from "../datatypes/settings";

interface Settings {
    config: SettingsConfig;
    values: SettingsValues;
}

export default class SettingsModel extends Model<Settings, DummyDatasource> {
    static alias = 'settings';

    protected defaultState: Settings = {
        config: {},
        values: {}
    };

    init(state: Partial<Settings>) {
        super.init({config: state.config});

        const values: SettingsValues = {};

        for (const [cat_key, category] of Object.entries(this.state.config)) {
            values[cat_key] = {};

            for (const group of category.groups) {
                for (const [key, setting] of Object.entries(group.settings)) {
                    values[cat_key][key] = setting.default;
                }
            }
        }

        // Apply defaults
        this.setState({values});
        // Apply custom values if provided
        this.setState({values: state.values});
    }

    public applySettings(values: SettingsValues) {
        this.setState({values});

        this.emit(new SettingsChangedEvent({values}));
    }

    public getValue(path: string): SettingValue {
        const [cat_key, key] = this.splitSettingPath(path);

        // get setting value
        return this.state.values[cat_key][key];
    }

    public setValue(path: string, value: SettingValue): void {
        const [cat_key, key] = this.splitSettingPath(path);

        // set setting value
        this.state.values[cat_key][key] = value;

        this.applySettings({[cat_key]: {[key]: value}});
    }

    public isLocked(path: string): boolean {
        const [cat_key, key] = this.splitSettingPath(path);

        return !!this.getSetting(cat_key, key).is_locked;
    }

    protected splitSettingPath(path: string): [string, string] {
        const [cat_key, key] = path.split('.');

        if (!this.state.values.hasOwnProperty(cat_key)) throw new Error(`Category ${cat_key} does not exist`);
        if (!this.state.values[cat_key].hasOwnProperty(key)) throw new Error(`Setting ${path} does not exist`);

        return [cat_key, key];
    }

    protected getSetting(cat_key: string, key: string): Setting {
        const category = this.state.config[cat_key];

        if (!category) throw new Error(`Category '${cat_key}' does not exist`);

        for (const group of category.groups) {
            const setting = group.settings[key];

            if (group.settings.hasOwnProperty(key)) {
                return setting;
            }
        }

        throw new Error(`Setting '${key}' does not exist in any group of category '${cat_key}'`);
    }
}

export class SettingsChangedEvent extends ModelEvent<SettingsChangedEvent> {}
