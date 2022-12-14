import isEqual from "lodash/isEqual";
import defaultsDeep from "lodash/defaultsDeep";

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

/**
 * @category Core.Models
 */
interface SettingsModelState {
    config: SettingsConfig;
    values: SettingsValues;
    uncommitted: SettingsValues;
}

/**
 * @category Core.Models
 */
export default class SettingsModel extends Model<SettingsModelState, DummyDatasource> {
    static alias = 'settings';

    protected defaultState: SettingsModelState = {
        config: {},
        values: {},
        uncommitted: {},
    };

    init(state: Partial<SettingsModelState>) {
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

    public getBoolean(path: string, get_uncommited = false): boolean {
        return this.getValue(path, get_uncommited, SettingType.Boolean) as boolean;
    }

    public getNumber(path: string, get_uncommitted = false): number {
        return this.getValue(path, get_uncommitted, SettingType.Number) as number;
    }

    public getString(path: string, get_uncommitted = false): string {
        return this.getValue(path, get_uncommitted, SettingType.String) as string;
    }

    public getChoiceSingle(path: string, get_uncommitted = false): number|string {
        return this.getValue(path, get_uncommitted, SettingType.ChoiceSingle) as number|string;
    }

    public getValue(path: string, get_uncommitted = false, check_type?: SettingType): SettingValue {
        const [cat_key, key] = this.splitSettingPath(path);

        // check setting type
        if (check_type) {
            assert(this.getSetting(cat_key, key).type == check_type, "Invalid value type");
        }

        if (get_uncommitted &&
            cat_key in this.state.uncommitted &&
            key in this.state.uncommitted[cat_key]
        ) {
            return this.state.uncommitted[cat_key][key];
        }

        // get setting value
        return this.state.values[cat_key][key];
    }

    public setValue(path: string, value: SettingValue, force: boolean = false): void {
        let cat_key, key;

        [cat_key, key, value] = this.validateSetting(path, value);

        this.setValues({[cat_key]: {[key]: value}}, force);
    }

    /**
     * Apply specific settings as a tree or array of key-value pairs
     *
     * @param values
     * @param force
     */
    public setValues(values: SettingsValues, force: boolean = false) {
        if (force) {
            this.setState({uncommitted: values}, true);
        } else {
            this.setState({values}, true);
        }

        this.emit(new SettingsChangeEvent({values, force}));
    }

    public commit() {
        this.setState({values: this.getState().uncommitted}, true);
        this.setState({uncommitted: {}});
    }

    public hasUncommitted() {
        const state = this.getState();

        const committed = defaultsDeep(state.uncommitted, state.values);

        return !isEqual(committed, state.values);
    }

    public rejectUncommitted() {
        this.setState({uncommitted: {}});
        this.emit(new SettingsChangeEvent({values: this.getState().values, force: false}));
    }

    public isLocked(path: string): boolean {
        const [cat_key, key] = this.splitSettingPath(path);

        return !!this.getSetting(cat_key, key).is_locked;
    }

    public getSetting(cat_key: string, key: string): Setting {
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

    /**
     * Get category, key and validate value for specific key-value pair of settings
     *
     * @param path
     * @param value
     *
     * @protected
     */
    protected validateSetting<SV extends SettingValue>(path: string, value: SV): [string, string, SV] {
        const [cat_key, key] = this.splitSettingPath(path);

        // set setting value
        // this.state.values[cat_key][key] = value;

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
}

/**
 * @category Core.Models
 * @subcategory Events
 */
export class SettingsModalEvent extends ModelEvent<SettingsModalEvent> {}

/**
 * @category Core.Models
 * @subcategory Events
 */
export class SettingsChangeEvent extends ModelEvent<SettingsChangeEvent> {
    values: SettingsValues;
    force: boolean;
}
