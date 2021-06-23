import ContextMenu from "../core/ContextMenu"
import PlateContextMenu from "./PlateContextMenu";

export default class BoardContextMenu extends ContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_EXPORT()     {return "cmi_exp"}
    static get CMI_IMPORT()     {return "cmi_imp"}
    static get CMI_SELECTOR()   {return "cmi_sel"}
    static get CMI_SNAPSH_SVG() {return "cmi_snp_svg"}
    static get CMI_SNAPSH_PNG() {return "cmi_snp_png"}
    static get CMI_MOD_PHOTO()  {return "cmi_mod_pht"}
    static get CMI_MOD_SCHEMA() {return "cmi_mod_sch"}
    static get CMI_MOD_DETAIL() {return "cmi_mod_det"}
    static get CMI_MOD_VERBOS() {return "cmi_mod_vbs"}
    static get CMI_MOD_VERBOS_INP() {return "cmi_mod_vbs_inp"}

    constructor() {
        super();

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
                alias: BoardContextMenu.CMI_SELECTOR,
                label: 'Вкл/выкл. селектор плашек',
                active: true,
                shortcut: 'M'
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
                alias: BoardContextMenu.CMI_MOD_PHOTO,
                label: 'Вкл. фотографический режим',
                active: true,
            },
            // {
            //     alias: BoardContextMenu.CMI_MOD_SCHEMA,
            //     label: 'Вкл. схематический режим',
            //     active: true,
            // },
            {
                alias: BoardContextMenu.CMI_MOD_DETAIL,
                label: 'Вкл. схематический режим',
                active: true,
            },
            {
                alias: BoardContextMenu.CMI_MOD_VERBOS,
                label: () => this._getVerboseLabel(),
                active: true,
                as: {
                    alias: BoardContextMenu.CMI_MOD_VERBOS_INP,
                    beforeClick: () => this._beforeVerboseClick()
                }
            },
        ];

        this._verbose_on = false;
    }

    _beforeVerboseClick() {
        this._verbose_on = !this._verbose_on;

        return !!this._verbose_on;
    }

    _getVerboseLabel() {
        return this._verbose_on ? 'Выкл. подробности' : 'Вкл. подробности';
    }
}