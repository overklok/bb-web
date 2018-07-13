import ContextMenu from "../core/ContextMenu"

export default class BoardContextMenu extends ContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_EXPORT() {return "cmi_exp"}
    static get CMI_IMPORT() {return "cmi_imp"}

    constructor(container, grid, item_height) {
        super(container, grid, item_height);

        this._items_data = [
            {
                label: `Плата`,
                active: false
            },
            {
                alias: BoardContextMenu.CMI_EXPORT,
                label: 'Экспорт плашек...',
                active: true
            },
            {
                alias: BoardContextMenu.CMI_IMPORT,
                label: 'Импорт плашек',
                active: true,
                input: {
                    type: "file",
                }
            },
        ];
    }
}