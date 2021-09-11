import {SettingType} from "../../core/datatypes/settings";

import i18next from 'i18next';

export default function (allow_demo: boolean) {
    return {
        general: {
            title: i18next.t('settings:general.title'),
            groups: [
                {
                    settings: {
                        is_demo: {
                            title: i18next.t('settings:general.settings.is_demo.title'),
                            type: SettingType.Boolean,
                            default: false,
                            is_locked: !allow_demo
                        }
                    }
                }
            ]
        },
        board: {
            title: i18next.t('settings:board.title'),
            groups: [
                {
                    title: i18next.t('settings:board.groups.debug.title'),
                    settings: {
                        is_verbose: {
                            title: i18next.t('settings:board.settings.is_verbose'),
                            type: SettingType.Boolean,
                            default: false,
                        },
                        is_debug: {
                            title: i18next.t('settings:board.settings.is_debug'),
                            type: SettingType.Boolean,
                            default: false,
                        }
                    }
                }
            ]
        }
    }
}
