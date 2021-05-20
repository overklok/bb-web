import {assert} from "../helpers/functions";

export type SettingChoices = string[] | number[];
export type SettingValue = boolean | string | number | string[] | number[];

export const enum SettingType {
    Boolean,
    Number,
    String,
    ChoiceSingle,
    ChoiceMultiple
}

export interface Setting {
    title: string;
    type: SettingType;
    default: SettingValue;
    choices?: SettingChoices;
    is_locked?: boolean;
}

export interface SettingGroup {
    title?: string;
    settings: { [key: string]: Setting };
}

export interface SettingCategory {
    title: string;
    groups: SettingGroup[];
}

export interface SettingsConfig {
    [category: string]: SettingCategory
}

export interface SettingsValues {
    [category: string]: {
        [key: string]: SettingValue
    }
}

export type SettingsKVPairs = [key: string, value: SettingValue][];

export function assert_type(val: SettingValue, type: SettingType) {
    switch (type) {
        case SettingType.Boolean:           assert(typeof val === "boolean"); break;
        case SettingType.Number:            assert(typeof val === "number"); break;
        case SettingType.String:            assert(typeof val === "string"); break;
        case SettingType.ChoiceSingle:      assert(typeof val === "number" && Number.isInteger(val)); break;
        case SettingType.ChoiceMultiple:    assert(Array.isArray(val)); break;
    }
}