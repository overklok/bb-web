import PlateContextMenu from "../../menus/PlateContextMenu";

export default class SwitchPlateContextMenu extends PlateContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_SWITCH() {return "cmi_sw"}

    constructor(container, grid, extra, item_height) {
        super(container, grid, extra, item_height);

        this._items_data.push({
            label: `Доп. действия`,
            active: false
        });

        this._items_data.push({
            alias: SwitchPlateContextMenu.CMI_SWITCH,
            label: 'Переключить',
            // shortcut: 'Q',
            active: true,
            as: {alias: PlateContextMenu.CMI_SETADC, beforeClick: this._beforeClick}
        });

        this._on = false;
    }

    _beforeClick(value) {
        this._on = !this._on;

        return this._on ? 1 : 0;
    }
}