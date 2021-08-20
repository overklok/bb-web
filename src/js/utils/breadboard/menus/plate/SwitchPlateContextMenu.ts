import { XYObject } from "../../core/types";
import PlateContextMenu from "../PlateContextMenu";

/**
 * An exclusive version of context menu to use when clicking on a {@link SwitchPlate}
 */
export default class SwitchPlateContextMenu extends PlateContextMenu {
    /** Whether switch is toggled on */
    private _on: boolean;

    // Context menu items aliases
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

    /** @inheritdoc */
    public draw(position: XYObject, inputs: any[] = []) {
        // Set initial field value to correspond with the state given before actual draw
        this.setValue(inputs[0]);

        const container = super.draw(position, inputs);

        return container;
    }

    /**
     * Sets the switch state
     * 
     * Note that the actual state is not dependent of this action,
     * because it's handled in the plate itself
     * 
     * @param value 
     */
    public setValue(value: any) {
        this._on = !!value;
    }

    /**
     * Handle context menu item click
     * to toggle the switch flag
     * 
     * @returns is the switch opened
     */
    private _beforeClick(): boolean {
        this._on = !this._on;

        return !!this._on;
    }

    /**
     * Generate the text displayed in the 'switch toggle' context menu item 
     * 
     * @returns the text to display
     */
    private _getLabel(): string {
        return this._on ? '[РАЗ.] Замкнуть' : '[ЗАМК.] Разомкнуть';
    }
}