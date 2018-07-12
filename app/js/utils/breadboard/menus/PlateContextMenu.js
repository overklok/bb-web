import ContextMenu from "../core/ContextMenu"

export default class PlateContextMenu extends ContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_REMOVE() {return "cmi_rm"}
    static get CMI_SETADC() {return "cmi_adc"}
    static get CMI_ROTCW()  {return "cmi_rcw"}
    static get CMI_ROTCCW() {return "cmi_rccw"}
    static get CMI_DUPLIC() {return "cmi_dupl"}

    constructor(container, grid, extra, item_height) {
        super(container, grid, item_height);

        this._items_data = [
            {
                label: `Плашка #${extra.id}`,
                active: false
            },
            {
                alias: PlateContextMenu.CMI_DUPLIC,
                label: 'Дублировать',
                shortcut: 'D',
                active: true
            },
            {
                alias: PlateContextMenu.CMI_SETADC,
                label: 'Установить АЦП:',
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