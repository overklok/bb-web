import ContextMenu, { ContextMenuItemInputType } from "../core/ContextMenu"

/**
 * Context menu intended to draw when clicking on the plate
 */
export default class PlateContextMenu extends ContextMenu {
    // Context menu items aliases
    static get CMI_REMOVE() {return "cmi_rm"}
    static get CMI_INPUT()  {return "cmi_inp"}
    static get CMI_ROTCW()  {return "cmi_rcw"}
    static get CMI_ROTCCW() {return "cmi_rccw"}
    static get CMI_DUPLIC() {return "cmi_dupl"}

    constructor(plate_id: number, plate_type: string, plate_variant: string) {
        super(plate_id, plate_type, plate_variant);

        this._items_props = [
            {
                label: `Плашка #${plate_id}`,
                shortcuts: [plate_type, plate_variant],
                active: false
            },
            {
                alias: PlateContextMenu.CMI_DUPLIC,
                label: 'Дублировать',
                shortcut: 'D',
                active: true
            },
            {
                alias: PlateContextMenu.CMI_INPUT,
                label: 'Ввод:',
                shortcuts: ['<', '>'],
                active: true,
                input: {
                    type: ContextMenuItemInputType.Number,
                    min: 0,
                    max: 255
                }
            },
            {
                alias: PlateContextMenu.CMI_ROTCW,
                label: 'Повернуть по часовой',
                shortcut: ']',
                active: true
            },
            {
                alias: PlateContextMenu.CMI_ROTCCW,
                label: 'Повернуть против часовой',
                shortcut: '[',
                active: true
            },
            {
                alias: PlateContextMenu.CMI_REMOVE,
                label: 'Удалить',
                shortcut: 'Delete',
                active: true
            },
        ];
    }
}