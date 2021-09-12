import {SettingType} from "../../core/datatypes/settings";

import i18next from 'i18next';

export default function (allow_demo: boolean) {
    return {
        general: {
            title: 'settings:general.title',
            groups: [
                {
                    settings: {
                        is_demo: {
                            title: 'settings:general.settings.is_demo.title',
                            type: SettingType.Boolean,
                            default: false,
                            is_locked: !allow_demo
                        },
                        language: {
                            title: 'Language',
                            type: SettingType.ChoiceSingle,
                            choices: [
                                { value: 'en', label: '🇺🇸 English' },
                                { value: 'ru', label: '🇷🇺 Русский' },
                            ],
                            default: 'en',
                        }
                    }
                }
            ]
        },
        board: {
            title: 'settings:board.title',
            groups: [
                {
                    title: 'settings:board.groups.debug.title',
                    settings: {
                        is_verbose: {
                            title: 'settings:board.settings.is_verbose',
                            type: SettingType.Boolean,
                            default: false,
                        },
                        is_debug: {
                            title: 'settings:board.settings.is_debug',
                            type: SettingType.Boolean,
                            default: false,
                        }
                    }
                }
            ]
        }
    }
}
