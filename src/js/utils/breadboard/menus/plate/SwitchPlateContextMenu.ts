import { XYObject } from "../../core/types";
import PlateContextMenu from "../PlateContextMenu";

export default class SwitchPlateContextMenu extends PlateContextMenu {
    private _on: boolean;
    // Алиасы пунктов контекстного меню
    static get CMI_SWITCH() {return "cmi_sw"}

    constructor(item_id: number, plate_type: string, plate_variant: string) {
        super(item_id, plate_type, plate_variant);

        this._items_props.push({
            label: `Доп. действия`,
            active: false
        });

        this._items_props.push({
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

    draw(position: XYObject, inputs: any[] = []) {
        this.setValue(inputs[0]);

        const container = super.draw(position, inputs);

        return container;
    }

    setValue(value: any) {
        this._on = !!value;
    }

    _beforeClick() {
        this._on = !this._on;

        return !!this._on;
    }

    _getLabel() {
        return this._on ? '[РАЗ.] Замкнуть' : '[ЗАМК.] Разомкнуть';
    }
}