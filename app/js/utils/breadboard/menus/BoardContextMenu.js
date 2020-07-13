import ContextMenu from "../core/ContextMenu"
import PlateContextMenu from "./PlateContextMenu";

export default class BoardContextMenu extends ContextMenu {
    // Алиасы пунктов контекстного меню
    static get CMI_EXPORT()     {return "cmi_exp"}
    static get CMI_IMPORT()     {return "cmi_imp"}
    static get CMI_SNAPSH_SVG() {return "cmi_snp_svg"}
    static get CMI_SNAPSH_PNG() {return "cmi_snp_png"}
    static get CMI_MOD_PHOTO()  {return "cmi_mod_pht"}
    static get CMI_MOD_SCHEMA() {return "cmi_mod_sch"}
    static get CMI_MOD_DETAIL() {return "cmi_mod_det"}
    static get CMI_MOD_VERBOS() {return "cmi_mod_vbs"}
    static get CMI_MOD_VERBOS_INP() {return "cmi_mod_vbs_inp"}
    static get CMI_LAY_BASIC() {return "cmi_lay_basic"}
    static get CMI_LAY_ADVAN() {return "cmi_lay_advan"}

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
                label: () => {return this._getVerboseLabel()},
                active: true,
                as: {
                    alias: BoardContextMenu.CMI_MOD_VERBOS_INP,
                    beforeClick: () => {return this._beforeVerboseClick()}
                }
            },
            {
                alias: BoardContextMenu.CMI_LAY_BASIC,
                label: 'Базовая тапанда [6.3.1]',
                active: true
            },
            {
                alias: BoardContextMenu.CMI_LAY_ADVAN,
                label: 'Расширенная тапанда',
                active: true
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