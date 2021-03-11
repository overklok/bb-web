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
