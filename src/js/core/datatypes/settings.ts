/**
 * @module
 * 
 * Data objects for setting system, with {@link SettingsModel} in front of it
 */

import {assert} from "../helpers/functions";

export type SettingChoices = { value: string|number, label: string }[];
export type SettingValue = boolean | string | number | string[] | number[];

/**
 * Types of settings available
 * 
 * @category Core
 * @subcategory Misc
 */
export const enum SettingType {
    Boolean,
    Number,
    String,
    ChoiceSingle,
    ChoiceMultiple
}

/**
 * Setting description
 * 
 * 1st level of setting hierarchy.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface Setting {
    /** setting title */
    title: string;
    /** setting type */
    type: SettingType;
    /** default value */
    default: SettingValue;
    /** list of possible values if applicable */
    choices?: SettingChoices;
    /** is the setting updates is allowed */
    is_locked?: boolean;
}

/**
 * Subcategory of settings
 * 
 * 2nd level of setting hierarchy.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface SettingGroup {
    /** subcategory title */
    title?: string;
    /** settings in the subcategory */
    settings: { [key: string]: Setting };
}

/**
 * Category of settings' groups
 * 
 * 3rd level of setting hierarchy.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface SettingCategory {
    /** category title */
    title: string;
    /** settings groups */
    groups: SettingGroup[];
}

/**
 * Descriptions of settings 
 * 
 * Contains full setting hierarchy.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface SettingsConfig {
    [category: string]: SettingCategory
}

/**
 * Values of settings, categorized like its {@link SettingsConfig}
 * 
 * Contains full setting hierarchy.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface SettingsValues {
    [category: string]: {
        [key: string]: SettingValue
    }
}

/**
 * @category Core
 * @subcategory Misc
 */
export type SettingsKVPairs = [key: string, value: SettingValue][];

/**
 * Setting type validation helper
 * 
 * @param val   value required to keep in the model
 * @param type  type of the setting for which the value is being validated
 * 
 * @category Core
 * @subcategory Misc
 */
export function assert_type(val: SettingValue, type: SettingType) {
    switch (type) {
        case SettingType.Boolean:           assert(typeof val === "boolean", "Expected the value to be a Boolean"); break;
        case SettingType.Number:            assert(typeof val === "number",  "Expected the value to be a Number"); break;
        case SettingType.String:            assert(typeof val === "string",  "Expected the value to be a String"); break;
        case SettingType.ChoiceSingle:      assert(["number", "string"].indexOf(typeof val) !== -1 , "Expected the value to be an integer or string"); break;
        case SettingType.ChoiceMultiple:    assert(Array.isArray(val), "Expected the value to be an array"); break;
    }
}