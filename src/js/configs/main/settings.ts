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
        },
        board: {
            title: 'Доска',
            groups: [
                {
                    title: 'Отладка',
                    settings: {
                        is_verbose: {
                            title: 'Показывать подробности',
                            type: SettingType.Boolean,
                            default: false,
                        },
                        is_debug: {
                            title: 'Подсвечивать ячейки',
                            type: SettingType.Boolean,
                            default: false,
                        }
                    }
                }
            ]
        }
    }
}
