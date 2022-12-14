import {SettingType} from "../../core/datatypes/settings";

export default function (lang: string, allow_demo: boolean, is_demo_default: boolean) {
    return {
        general: {
            title: 'settings:general.title',
            groups: [
                {
                    settings: {
                        is_demo: {
                            title: 'settings:general.settings.is_demo.title',
                            type: SettingType.Boolean,
                            default: is_demo_default,
                            is_locked: !allow_demo
                        },
                        language: {
                            title: 'Language',
                            type: SettingType.ChoiceSingle,
                            choices: [
                                { value: 'en', label: 'English' },
                                { value: 'ru', label: 'Русский' },
                            ],
                            default: lang || 'en',
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
