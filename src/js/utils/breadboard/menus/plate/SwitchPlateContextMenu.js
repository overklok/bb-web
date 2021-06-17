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
            label: () => {return this._getLabel()},
            shortcut: 'Q',
            active: true,
            as: {
                alias: PlateContextMenu.CMI_INPUT,
                beforeClick: () => {return this._beforeClick()}
            }
        });

        this._on = false;
    }

    draw(position, inputs=[]) {
        this.setValue(inputs[0]);

        const container = super.draw(position, inputs);

        return container;
    }

    setValue(value) {
        this._on = !!value;
    }

    _beforeClick(value) {
        this._on = !this._on;

        return !!this._on;
    }

    _getLabel() {
        return this._on ? '[РАЗ.] Замкнуть' : '[ЗАМК.] Разомкнуть';
    }
}