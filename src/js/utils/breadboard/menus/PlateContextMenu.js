import ContextMenu from "../core/ContextMenu"
import SelectorLayer from "~/js/utils/breadboard/layers/SelectorLayer";

export default class PlateContextMenu extends ContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_REMOVE() {return "cmi_rm"}
    static get CMI_INPUT()  {return "cmi_inp"}
    static get CMI_ROTCW()  {return "cmi_rcw"}
    static get CMI_ROTCCW() {return "cmi_rccw"}
    static get CMI_DUPLIC() {return "cmi_dupl"}

    constructor(plate_id, plate_type) {
        super(plate_id);

        let plate_naming = SelectorLayer.plateTypeToTitle(plate_type) || 'Плашка';

        this._items_data = [
            {
                label: `${plate_naming} #${plate_id}`,
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
                active: true,
                input: {
                    type: "number",
                    min: 0,
                    max: 255
                }
            },
            {
                alias: PlateContextMenu.CMI_ROTCW,
                label: 'Повернуть по часовой',
                shortcut: '[',
                active: true
            },
            {
                alias: PlateContextMenu.CMI_ROTCCW,
                label: 'Повернуть против часовой',
                shortcut: ']',
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