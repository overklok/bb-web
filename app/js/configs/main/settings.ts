import {SettingType} from "../../core/datatypes/settings";

export default function (allow_demo: boolean) {
    return {
        general: {
            title: 'Основные',
            groups: [
                {
                    settings: {
                        is_demo: {
                            title: 'Автономный режим',
                            type: SettingType.Boolean,
                            default: false,
                            is_locked: !allow_demo
                        }
                    }
                }
            ]
        }
    }
}