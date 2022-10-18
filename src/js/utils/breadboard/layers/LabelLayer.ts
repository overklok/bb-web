import SVG from "svg.js";

import Layer from "../core/Layer";
import { extractLabeledCells } from "~/js/utils/breadboard/core/extras/helpers";
import Grid from "../core/Grid";
import { Layout, CellRole } from "../core/extras/types";

const SYMBOL_UP = "\u2191";
const SYMBOL_DOWN = "\u2193";

const LABEL_STYLE_DEFAULT = {
    font_size: 20,
    text_bias: 10
};

/**
 * Renders textual info to the board
 *
 * @category Breadboard
 * @subcategory Layers
 */
export default class LabelLayer extends Layer {
    /** CSS class of the layer */
    static get Class() {
        return "bb-layer-label";
    }

    /** layer's main SVG container */
    protected _container: SVG.Container;

    /** SVG group for labels */
    private _labelgroup: SVG.Container;

    /** topology configurations of specific breadboard */
    private _layout_config: Layout;

    /** pin state SVG labels */
    private _pinval_labels: SVG.Text[];

    /** text style of SVG labels */
    private _label_style: { font_size: number; text_bias: number };

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

        this._container.addClass(LabelLayer.Class);

        this._labelgroup = undefined;

        this._layout_config = undefined;

        this._pinval_labels = [];

        this._label_style = {
            font_size: LABEL_STYLE_DEFAULT.font_size,
            text_bias: LABEL_STYLE_DEFAULT.text_bias
        };

        this._initGroups();
    }

    /**
     * Sets the board topology required to display pin numbers and directions
     *
     * @param layout_config
     */
    public setLayoutConfig(layout_config: Layout) {
        this._layout_config = layout_config;
    }

    /**
     * @inheritdoc
     */
    public compose() {
        this._drawLabels();
    }

    /**
     * @inheritdoc
     */
    public recompose(schematic: boolean, detailed: boolean = false, verbose: boolean = false) {
        super.recompose(schematic, detailed, verbose);

        this._initGroups();
        this.compose();
    }

    /**
     * Sets the visual style of layer's labels
     *
     * @param style
     */
    public setLabelStyle(style: { font_size: number; text_bias: number }) {
        if (style && style.font_size != null) {
            this._label_style.font_size = style.font_size;
        } else {
            this._label_style.font_size = LABEL_STYLE_DEFAULT.font_size;
        }

        if (style && style.text_bias != null) {
            this._label_style.text_bias = style.text_bias;
        } else {
            this._label_style.text_bias = LABEL_STYLE_DEFAULT.text_bias;
        }
    }

    /**
     * Sets the values and updates modes of the pins
     *
     * Method updates pin states for all items presented in array
     *
     * @param values_arr array, where keys are pin numbers and values are
     *                   string-number pairs for pin's mode and value.
     */
    public setPinsValues(values_arr: [string, number][]) {
        if (!values_arr || !Array.isArray(values_arr)) {
            throw new TypeError("Pin values must be an array");
        }

        let i = 0;

        for (const pinval_label of this._pinval_labels) {
            const [mode, value] = values_arr.hasOwnProperty(i) ? values_arr[i] : [null, 0];

            let arrow = "",
                color = "black";

            if (mode === "input") {
                arrow = SYMBOL_UP;
                color = "green";
            }

            if (mode === "output") {
                arrow = SYMBOL_DOWN;
                color = "red";
            }

            if (value === 0) {
                arrow = "";
                color = "#878787";
            }

            if (mode !== null) {
                pinval_label.text(`${value}${arrow}`).fill(color).font({ anchor: "middle" });
            } else {
                pinval_label.text(``).fill("black").font({ anchor: "middle" });
            }

            i++;
        }
    }

    /**
     * Initializes internal SVG groups
     *
     * Removes previously created groups and re-attaches event handlers
     */
    private _initGroups() {
        this._clearGroups();

        this._labelgroup = this._container.group();
    }

    /**
     * Removes SVG groups created previously with {@link _initGroups}
     */
    private _clearGroups() {
        if (this._labelgroup) this._labelgroup.remove();
    }

    /**
     * Renders text items responsible for pin state display
     */
    private _drawLabels() {
        if (!this._layout_config) return;

        const font_size = this._label_style.font_size,
            text_bias = this._label_style.text_bias;

        const i = extractLabeledCells(this._layout_config);

        for (const labeled of extractLabeledCells(this._layout_config)) {
            const cell = labeled.cell;

            let text = "*",
                pos_y = cell.center.y - cell.size.y - text_bias;

            switch (labeled.role) {
                case CellRole.Plus: {
                    text = "+";
                    break;
                }
                case CellRole.Minus: {
                    text = "-";
                    break;
                }
                case CellRole.Analog: {
                    text = "A" + labeled.pin_num;
                    break;
                }
            }

            switch (labeled.label_pos) {
                case "top":
                    pos_y = cell.center.y - cell.size.y - text_bias / 2;
                    break;
                case "bottom":
                    pos_y = cell.center.y + cell.size.y + text_bias / 2;
                    break;
                default:
                    pos_y = cell.center.y - cell.size.y / 2 - text_bias;
                    break;
            }

            this._drawLabelText(cell.center.x, pos_y, text, font_size);

            if (labeled.role === CellRole.Analog) {
                let cx = labeled.cell.center.x,
                    cy = pos_y;

                switch (labeled.value_orientation) {
                    case "north": {
                        cy -= cell.size.y;
                        break;
                    }
                    case "south": {
                        cy += cell.size.y * 0.1;
                        break;
                    }
                    case "west": {
                        cy -= cell.size.y * 0.45;
                        cx -= cell.size.x * 1.2;
                        break;
                    }
                    case "east": {
                        cy -= cell.size.y * 0.45;
                        cx += cell.size.x * 1.2;
                        break;
                    }
                }

                this._pinval_labels[labeled.pin_num] = this._drawLabelText(cx, cy, "", font_size + 4);
            }
        }
    }

    /**
     * Draws single label to represent pin state
     *
     * @see _drawLabels
     *
     * @param pos_x     absolute horizontal position of the label in SVG document
     * @param pos_y     absolute vertical position of the label in SVG document
     * @param text      text content of the label
     * @param size      font size for the text (px)
     * @param weight    font weight for the text (px)
     *
     * @returns SVG text element rendered
     */
    private _drawLabelText(pos_x: number, pos_y: number, text: string, size: number, weight: string = "bold") {
        return this._labelgroup
            .text(text)
            .font({ size, weight, family: "'IBM Plex Mono', 'Lucida Console', Monaco, monospace" })
            .center(pos_x, pos_y);

        // .rect(this._params.width, this._params.thickness)
        //     .dy(-this._params.thickness)
        //     .fill({color: "#77ff1b"})
        //     .opacity(0);
    }

    // /**
    //  * Draws single direction pointer to prepresent pin mode (or direction, input or output)
    //  *
    //  * @param pane_name name of the label pane (top, bottom)
    //  * @param pos_x     horizontal position of the label relative to its pane
    //  * @param pos_y     vertical position of the label relative to its pane
    //  */
    // _drawLabelArrows(pane_name: string, pos_x, pos_y) {
    //     let wrap = this._panes[pane_name].nested();

    //     let cell = this.__grid.cell(0,0);

    //     let w = cell.size.x / 2.8,        // width
    //         h = cell.size.y / 7;      // height

    //     let p = cell.size.y / 7;      // padding

    //     wrap.path([
    //         ['M', 0, 0],    ['l', w/2, h], ['l', w/2, -h],
    //         ['m', -w, p],   ['l', w/2, h], ['l', w/2, -h],
    //         ['m', -w, p],   ['l', w/2, h], ['l', w/2, -h],
    //     ])
    //         .fill({opacity: 0})
    //         .stroke({color: "#000", width: 5})
    //         .center(pos_x, pos_y)
    //         .y(pos_y - p * 2);
    // }
}
