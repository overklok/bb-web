import ContextMenu from "../core/ContextMenu"

export default class BoardContextMenu extends ContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_EXPORT()     {return "cmi_exp"}
    static get CMI_IMPORT()     {return "cmi_imp"}
    static get CMI_SNAPSH_SVG() {return "cmi_snp_svg"}
    static get CMI_SNAPSH_PNG() {return "cmi_snp_png"}
    static get CMI_SCHEMA()     {return "cmi_sch"}

    constructor(container, grid, item_height) {
        super(container, grid, item_height);

        this._items_data = [
            {
                label: `Плата`,
                active: false
            },
            {
                alias: BoardContextMenu.CMI_SNAPSH_SVG,
                label: 'Снимок платы (SVG)',
                active: true
            },
            {
                alias: BoardContextMenu.CMI_SNAPSH_PNG,
                label: 'Снимок платы (PNG) [эксперим.]',
                active: true
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
            {
                alias: BoardContextMenu.CMI_SCHEMA,
                label: 'Вкл./Выкл. схематический режим',
                active: true,
            },
        ];
    }
}