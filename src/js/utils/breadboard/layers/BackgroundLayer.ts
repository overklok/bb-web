import SVG from "svg.js";

import Layer from "../core/Layer";
import Grid from "../core/Grid";

/**
 * Contains background canvas for the breadboard *
 *
 * @category Breadboard
 * @subcategory Layers
 */
export default class BackgroundLayer extends Layer {
    /** CSS class of the layer */
    static Class = "bb-layer-background";

    /** layer's main SVG container */
    protected _container: SVG.Container;

    /** SVG group for the board background */
    private _boardgroup: SVG.Container;

    private _bg_visible: boolean;

    /**
     * @inheritdoc
     */
    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.addClass(BackgroundLayer.Class);

        this._boardgroup = undefined;

        this._initGroups();
    }

    /**
     * Controls board background rectangle visibility
     *
     * The method is expected to call before the {@link compose} is called
     *
     * @param is_visible
     */
    public setBgVisible(is_visible: boolean) {
        this._bg_visible = is_visible;
    }

    /**
     * Draws contents for the layer
     */
    public compose() {
        const bgrect = this._boardgroup
            .rect()
            .width("99%")
            .height("99%") /// 99 из-за обрезания рамки
            .radius(20)
            .fill({ color: "#f9f9f9" })
            .stroke({ color: "#c9c9c9", width: 4 })
            .move(4, 4);

        if (!this._bg_visible) {
            bgrect.opacity(0);
        }
    }

    /**
     * @inheritdoc
     */
    public recompose(schematic: boolean, detailed: boolean, verbose: boolean) {
        super.recompose(schematic, detailed, verbose);

        this._initGroups();
        this.compose();
    }

    /**
     * Initializes internal SVG groups
     *
     * Removes previously created groups and re-attaches event handlers
     */
    private _initGroups() {
        this._clearGroups();

        this._boardgroup = this._container.group();
    }

    /**
     * Removes SVG groups created previously with {@link _initGroups}
     */
    private _clearGroups() {
        if (this._boardgroup) this._boardgroup.remove();
    }
}
