import DummyDatasource from "../base/model/datasources/DummyDatasource";
import Model from "../base/model/Model";
import {ModelEvent} from "../base/Event";
import {
    assert_type,
    Setting,
    SettingsConfig,
    SettingsValues,
    SettingType,
    SettingValue
} from "../datatypes/settings";
import {assert} from "../helpers/functions";

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

    public showSettingsModal() {
        this.emit(new SettingsModalEvent());
    }

    public getBoolean(path: string): boolean {
        return this.getValue(path, SettingType.Boolean) as boolean;
    }

    public getNumber(path: string): number {
        return this.getValue(path, SettingType.Number) as number;
    }

    public getString(path: string): string {
        return this.getValue(path, SettingType.String) as string;
    }

    /**
     * Apply specific settings as a tree or array of key-value pairs
     *
     * @param values
     * @param is_manual
     */
    public applySettings(values: SettingsValues, is_manual: boolean = false) {
        this.setState({values}, true);

        this.emit(new SettingsChangeEvent({values: values, is_manual}));
    }

    public getValue(path: string, check_type?: SettingType): SettingValue {
        const [cat_key, key] = this.splitSettingPath(path);

        // check setting type
        if (check_type) {
            assert(this.getSetting(cat_key, key).type == check_type);
        }

        // get setting value
        return this.state.values[cat_key][key];
    }

    public setValue(path: string, value: SettingValue, is_manual: boolean = false): void {
        let cat_key, key;

        [cat_key, key, value] = this.setSettingValueState(path, value);

        this.applySettings({[cat_key]: {[key]: value}}, is_manual);
    }

    public isLocked(path: string): boolean {
        const [cat_key, key] = this.splitSettingPath(path);

        return !!this.getSetting(cat_key, key).is_locked;
    }

    /**
     * Set state for specific key-value pair of settings
     *
     * @param path
     * @param value
     * @protected
     */
    protected setSettingValueState<SV extends SettingValue>(path: string, value: SV): [string, string, SV] {
        const [cat_key, key] = this.splitSettingPath(path);

        // set setting value
        this.state.values[cat_key][key] = value;

        // check value type
        const type = this.getSetting(cat_key, key).type;
        assert_type(value, type);

        return [cat_key, key, value];
    }

    protected splitSettingPath(path: string): [string, string] {
        const [cat_key, key] = path.split('.');

        if (!this.state.values.hasOwnProperty(cat_key)) throw new Error(`Category '${cat_key}' does not exist`);
        if (!this.state.values[cat_key].hasOwnProperty(key)) throw new Error(`Setting '${path}' does not exist`);

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

export class SettingsModalEvent extends ModelEvent<SettingsModalEvent> {}
export class SettingsChangeEvent extends ModelEvent<SettingsChangeEvent> {
    values: SettingsValues;
    is_manual: boolean;
}
