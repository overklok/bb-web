import Cell from "./Cell";
import { isDomainAnalog } from "./extras/helpers_data";
import { ElecLayout, _scanAnalogDomains, _scanDomains } from "./extras/helpers_elec";
import { isFixedXY, pointseq, rangeOrPointToRange, sliceXYRange } from "./extras/helpers_point";
import {
    CellRole,
    Domain,
    DomainDecl,
    DomainTable,
    EmbeddedPlate,
    Layout,
    PinState,
    XYPoint,
    XYRange
} from "./extras/types";

/**
 * Type of 'out-of-bound' behavour for cell search functions
 *
 * When a function receives indices that go over the boundaries of a {@link Grid},
 * it can throw an exception or consider a fallback for invalid index.
 * To define typical behavior which may be required to follow, this type should be used.
 *
 * @category Breadboard
 */
export enum BorderType {
    None = "none", // throw an exception / do nothing              | [1 2 3 E E E]
    Replicate = "replicate", // 'continue' the last index available          | [1 2 3 3 3 3]
    // for each dimenision
    Reflect = "reflect", // reverse index sequence from the boundary     | [1 2 3 3 2 1]
    Wrap = "wrap" // loop index sequence from the boundary        | [1 2 3 1 2 3]
}

/**
 * Types of auxiliary points, which has non-regular (martix) positions,
 * that can be used on the board
 *
 * Each point can be specified in the {@link Grid} only within a corresponding {@link AuxPointType}.
 *
 * @category Breadboard
 */
export enum AuxPointType {
    // Voltage and ground pins
    Vcc = "vcc",
    Gnd = "gnd",

    // USB 1 pins
    U1Vcc = "u1_vcc",
    U1Gnd = "u1_gnd",
    U1Analog1 = "u1_a1",
    U1Analog2 = "u1_a2",

    // USB 3 pins
    U3Vcc = "u3_vcc",
    U3Gnd = "u3_gnd",
    U3Analog1 = "u3_a1",
    U3Analog2 = "u3_a2"
}

/**
 * Categories
 *
 * @category Breadboard
 */
export enum AuxPointCategory {
    // Source pins for 5th revision of the board
    SourceV5 = "source-v5",
    // Source pins for 8th revision of the board
    SourceV8 = "source-v8",
    // USB1 pins
    Usb1 = "usb1",
    // USB3 pins
    Usb3 = "usb3"
}

/**
 * A set of fixed properties of the {@link Grid}
 *
 * @category Breadboard
 */
type GridParams = {
    dim: { x: number; y: number };
    size: { x: number; y: number };
    gap: { x: number; y: number };
    pos: { x: number; y: number };
    wrap: { x: number; y: number };
};

type LineAnalogData = {
    pin_state_initial: PinState;
    minus: {
        single?: XYPoint;
        from: XYPoint;
        to: XYPoint;
    };
};

/**
 * A visible point which is displaced arbitrarily on the {@link Grid}
 *
 * Each {@link AuxPoint} has a name and belongs to some {@link AuxPointCategory}.
 *
 * @category Breadboard
 */
export type AuxPoint = {
    idx: { x: number; y: number };
    pos: { x: number; y: number };
    cell: Cell;
    name: AuxPointType;
    cat: AuxPointCategory;
    bias?: number;
};

type AuxPointOrRow<K> = K extends string ? AuxPoint : AuxPoint[];
type AuxPointMap = Map<string | number, AuxPoint | AuxPoint[]>;

/**
 * Logical representation of the breadboard grid
 *
 * {@link Grid} does not make any drawing, it just stores the collection of {@link Cell}s
 * and contains helper methods to manage them.
 *
 * @category Breadboard
 */
export default class Grid {
    /** Table of domains */
    public readonly domains: DomainTable;

    /** TODO: Additional info that is not directly related to the Grid, should be generalized */
    public curr_straight_top_y: number;
    /** TODO: Additional info that is not directly related to the Grid, should be generalized */
    public curr_straight_bottom_y: number;

    /** An array of cells placed on the {@link Grid} */
    private _cells: Cell[][];
    /** A set of fixed properties of the {@link Grid} */
    private _params: GridParams;

    /** Categories of auxiliary points placed in the {@link Grid} */
    private _aux_points_cats: string[];

    /**
     * A set of virtual (invisible but logically important) points on the {@link Grid}
     */
    private readonly _virtual_points: { x: number; y: number }[];

    /**
     * A set of {@link AuxPoint} placed on the {@link Grid}.
     *
     * Auxiliary points don't fit into the standard matrix layout of the {@link Grid}
     * so they should be stored in specific attribute
     */
    private readonly _aux_points: AuxPointMap;

    static layoutToElecLayout(layout: Layout, embed_arduino = true) {
        return new Grid(layout).getElecLayout(embed_arduino);
    }

    /**
     * Creates the {@link Grid} instance
     */
    constructor(layout: Layout) {
        if (layout.dim.x <= 0 || layout.dim.y <= 0) throw new RangeError("Grid dimensions should be positive values");
        if (layout.size.x <= 0 || layout.size.y <= 0) throw new RangeError("Width/Height should be positive values");
        if (layout.pos.x < 0 || layout.pos.y < 0) throw new RangeError("Position X/Y should be non-negative values");
        if (layout.gap.x < 0 || layout.gap.y < 0) throw new RangeError("Gap X/Y should be non-negative values");
        if (layout.wrap.x < 0 || layout.wrap.y < 0) throw new RangeError("Wrap X/Y should be non-negative values");

        this._params = {
            dim: { ...layout.dim },
            size: { ...layout.size },
            gap: { ...layout.gap },
            pos: { ...layout.pos },
            wrap: { ...layout.wrap }
        };

        this.curr_straight_top_y = layout.curr_straight_top_y;
        this.curr_straight_bottom_y = layout.curr_straight_bottom_y;

        this._aux_points_cats = layout.aux_point_cats || [];

        this._cells = [];

        this._aux_points = new Map();
        this._virtual_points = [];

        this._createCells();

        if (layout.ddecls) {
            this._initAuxPoints();
            this._initVirtualPoints(layout.ddecls);
            this.domains = this._declsToDomains(layout.ddecls);
        }
    }

    /**
     * Dimension size of the {@link Grid} for each dimension (number of {@link Cell} items in a row/column)
     */
    get dim(): XYPoint {
        return this._params.dim;
    }

    /**
     * Geometric size of the {@link Grid} for each dimension
     */
    get size(): XYPoint {
        return this._params.size;
    }

    /**
     * Geometric distance between each {@link Cell} for each dimension
     */
    get gap(): XYPoint {
        return this._params.gap;
    }

    /**
     * Geometric position of the {@link Grid}'s matrix
     */
    get pos(): XYPoint {
        return this._params.pos;
    }

    /**
     * Geometric size of the board workspace for each dimension ({@link Grid} wrap)
     */
    get wrap() {
        return this._params.wrap;
    }

    /**
     * 2D-array of {@link Cell}s placed in the {@link Grid} matrix
     */
    get cells() {
        return this._cells;
    }

    /**
     * Returns {@link Cell} instance placed on the {@link Grid} matrix
     * nearest to given _geometrical_ coordinates
     *
     * Specific {@link BorderType} can be specified to set the search behavior.
     *
     * {@see cell()}
     *
     * @param x             horizontal geometric position
     * @param y             vertical geometric position
     * @param border_type   boundary cell selection behavior, described in {@link getCell}
     */
    public getCellByPos(x: number, y: number, border_type?: BorderType) {
        let ix = Math.floor(((x - this.pos.x) / this.size.x) * this.dim.x);
        let iy = Math.floor(((y - this.pos.y) / this.size.y) * this.dim.y);

        if (ix < 0) ix = 0;
        if (ix > this.dim.x - 1) ix = this.dim.x - 1;

        if (iy < 0) iy = 0;
        if (iy > this.dim.y - 1) iy = this.dim.y - 1;

        return this.getCell(ix, iy, border_type);
    }

    /**
     * Returns specific {@link Cell} from the {@link Grid}
     * by given indices
     *
     * Note that you can choose how to behave when indices go beyond
     * the {@link Grid} dimensions (i.e. out-of-bound conditions)
     *
     * Few type of out-of-bound behavior options are available:
     *  - Grid.BorderType.None      (throw an exception)
     *  - Grid.BorderType.Replicate (cell indices are equal to the nearest boundary)
     *  - Grid.BorderType.Reflect   (cell indices are mirrored)
     *  - Grid.BorderType.Wrap      (cell indides are looped)
     *
     * @param i column index
     * @param j row index
     * @param border_type boundary cell selection behavior
     */
    public getCell(i: number, j: number, border_type: BorderType = BorderType.None): Cell {
        if (!Number.isInteger(i) || !Number.isInteger(j)) {
            throw new TypeError("Indices must be integers");
        }

        switch (border_type) {
            case BorderType.Replicate: {
                i = i < 0 ? 0 : i;
                i = i >= this._params.dim.x ? this._params.dim.x - 1 : i;
                j = j < 0 ? 0 : j;
                j = j >= this._params.dim.y ? this._params.dim.y - 1 : j;
                break;
            }
            case BorderType.Reflect: {
                // TODO: Not needed yet
                break;
            }
            case BorderType.Wrap: {
                i = i < 0 ? (i % this._params.dim.x) + this._params.dim.x : i % this._params.dim.x;
                j = j < 0 ? (j % this._params.dim.y) + this._params.dim.y : j % this._params.dim.y;
                break;
            }
        }

        if (!(i in this._cells) || !(j in this._cells[i])) {
            throw new RangeError("Coordinates of cell is out of grid's range" + `: ${i}, ${j}`);
        }

        return this._cells[i][j];
    }

    /**
     * Returns auxiliary point placed on the {@link Grid}
     *
     * {@link AuxPoint}s are the points with arbitrary coordinates outside the matrix
     *
     * Note that points can be addressed both by pair of numeric coordinates and by single string key
     *
     * @param i string key / column index
     * @param j optional row index
     */
    public auxPoint<K extends number | string>(i: K): AuxPointOrRow<K>;
    public auxPoint(i: number, j: number): AuxPoint;
    public auxPoint<K extends number | string>(i: K, j?: number): AuxPointOrRow<K> {
        const item = this._aux_points.get(i);

        try {
            if (typeof i === "string") {
                if (Array.isArray(item)) throw new Error(i);
                return item as AuxPointOrRow<K>;
            }

            if (j !== null && typeof j === "number" && Array.isArray(item)) {
                return item[j] as AuxPointOrRow<K>;
            }
        } catch (TypeError) {
            return undefined;
        }
    }

    /**
     * Returns virtual points placed on the {@link Grid}
     *
     * @param x virtual column of the point
     * @param y virtual row of the point
     */
    public virtualPoint(x: number, y: number): XYPoint {
        if (!this._virtual_points) return;

        return this._virtual_points.find((point) => point.x === x && point.y === y);
    }

    /**
     * Returns whether the given auxiliary point category is required in the {@link Grid}
     *
     * Some components in Breadboard library may request this information to decide whether to display
     * graphic elements related to some of the points.
     *
     * @param cat
     */
    public isAuxPointCatRequired(cat: AuxPointCategory) {
        return this._aux_points_cats.indexOf(cat) !== -1;
    }

    public setLineVoltages(voltages: { [line_id: number]: number }) {}

    public getElecLayout(embed_arduino = true): ElecLayout {
        const ds = Object.entries(this.domains);

        const ds_normal = ds.filter(([_, d]) => !isDomainAnalog(d));
        const ds_analog = ds.filter(([_, d]) => isDomainAnalog(d));

        // scan normal domains
        const [cs, id_plus, id_minus] = _scanDomains(ds_normal);

        // scan analog domains
        const [cs_analog, emb_plates] = _scanAnalogDomains(ds_analog, embed_arduino, id_plus, id_minus);

        const point_minus = this.auxPoint(AuxPointType.Gnd) as AuxPoint,
            point_vcc = this.auxPoint(AuxPointType.Vcc) as AuxPoint;

        if (point_vcc && point_minus) {
            emb_plates.push(getVoltageSourcePlate(point_minus.idx, point_vcc.idx));
        }

        return {
            cell_struct: { ...cs, ...cs_analog },
            emb_plates
        };
    }

    /**
     * Initializes {@link Grid} matrix with regular {@link Cell}s
     *
     * @private
     */
    private _createCells() {
        // Массив ссылок на отрисованные точки
        this._cells = [];

        for (let i = 0; i < this.dim.x; i++) {
            this._cells[i] = [];

            for (let j = 0; j < this.dim.y; j++) {
                this._cells[i][j] = new Cell(i, j, this);
            }
        }
    }

    /**
     * Initializes auxiliary points based on categories specified for the {@link Grid}
     */
    private _initAuxPoints() {
        const celldist_y = this.getCell(0, 1).pos.y - this.getCell(0, 0).pos.y;

        if (this.isAuxPointCatRequired(AuxPointCategory.SourceV5)) {
            const source_center = {
                x: 80,
                y: this.getCell(0, 5).center.y + celldist_y / 2
            };

            this._aux_points.set(AuxPointType.Vcc, {
                idx: { x: -1, y: 1 },
                pos: { x: source_center.x, y: source_center.y - 20 },
                cell: this.getCell(0, 1, BorderType.Wrap),
                cat: AuxPointCategory.SourceV5,
                name: AuxPointType.Vcc
            });

            this._aux_points.set(AuxPointType.Gnd, {
                idx: { x: -1, y: this.dim.y - 1 },
                pos: { x: source_center.x, y: source_center.y + 20 },
                cell: this.getCell(0, -1, BorderType.Wrap),
                cat: AuxPointCategory.SourceV5,
                name: AuxPointType.Gnd
            });
        }

        if (this.isAuxPointCatRequired(AuxPointCategory.SourceV8)) {
            const source_center = {
                x: 80,
                y: this.getCell(0, 8).center.y + celldist_y / 2
            };

            this._aux_points.set(AuxPointType.Vcc, {
                idx: { x: -1, y: 0 },
                pos: { x: source_center.x, y: source_center.y - 20 },
                cell: this.getCell(0, 0, BorderType.Wrap),
                cat: AuxPointCategory.SourceV8,
                name: AuxPointType.Vcc
            });

            this._aux_points.set(AuxPointType.Gnd, {
                idx: { x: -1, y: this.dim.y - 1 },
                pos: { x: source_center.x, y: source_center.y + 20 },
                cell: this.getCell(0, -1, BorderType.Wrap),
                cat: AuxPointCategory.SourceV8,
                name: AuxPointType.Gnd
            });
        }

        // USB1

        if (this.isAuxPointCatRequired(AuxPointCategory.Usb1)) {
            const usb1_center = {
                // take border width into account
                x: this.wrap.x - 5,
                y: this.getCell(0, 4).center.y + celldist_y / 2
            };

            this._aux_points.set(AuxPointType.U1Vcc, {
                idx: { x: 8, y: 3 },
                pos: { x: usb1_center.x, y: usb1_center.y - 21 },
                cell: this.getCell(-1, 3, BorderType.Wrap),
                bias: 20,
                cat: AuxPointCategory.Usb1,
                name: AuxPointType.U1Vcc
            });

            this._aux_points.set(AuxPointType.U1Gnd, {
                idx: { x: 8, y: 6 },
                pos: { x: usb1_center.x, y: usb1_center.y + 21 },
                cell: this.getCell(-1, 6, BorderType.Wrap),
                bias: 20,
                cat: AuxPointCategory.Usb1,
                name: AuxPointType.U1Gnd
            });

            this._aux_points.set(AuxPointType.U1Analog1, {
                idx: { x: 8, y: 4 },
                pos: { x: usb1_center.x, y: usb1_center.y - 7 },
                cell: this.getCell(-1, 4, BorderType.Wrap),
                bias: 40,
                cat: AuxPointCategory.Usb1,
                name: AuxPointType.U1Analog1
            });

            this._aux_points.set(AuxPointType.U1Analog2, {
                idx: { x: 8, y: 5 },
                pos: { x: usb1_center.x, y: usb1_center.y + 7 },
                cell: this.getCell(-1, 5, BorderType.Wrap),
                bias: 40,
                cat: AuxPointCategory.Usb1,
                name: AuxPointType.U1Analog2
            });
        }

        // USB3

        if (this.isAuxPointCatRequired(AuxPointCategory.Usb3)) {
            const usb3_center = {
                // take border width into account
                x: this.wrap.x - 5,
                y: this.getCell(0, 10).center.y + celldist_y / 2
            };

            this._aux_points.set(AuxPointType.U3Vcc, {
                idx: { x: 8, y: 9 },
                pos: { x: usb3_center.x, y: usb3_center.y - 21 },
                cell: this.getCell(-1, 9, BorderType.Wrap),
                bias: 20,
                cat: AuxPointCategory.Usb3,
                name: AuxPointType.U3Vcc
            });

            this._aux_points.set(AuxPointType.U3Gnd, {
                idx: { x: 8, y: 12 },
                pos: { x: usb3_center.x, y: usb3_center.y + 21 },
                cell: this.getCell(-1, 12, BorderType.Wrap),
                bias: 20,
                cat: AuxPointCategory.Usb3,
                name: AuxPointType.U3Gnd
            });

            this._aux_points.set(AuxPointType.U3Analog1, {
                idx: { x: 8, y: 10 },
                pos: { x: usb3_center.x, y: usb3_center.y - 7 },
                cell: this.getCell(-1, 10, BorderType.Wrap),
                bias: 40,
                cat: AuxPointCategory.Usb3,
                name: AuxPointType.U3Analog1
            });

            this._aux_points.set(AuxPointType.U3Analog2, {
                idx: { x: 8, y: 11 },
                pos: { x: usb3_center.x, y: usb3_center.y + 7 },
                cell: this.getCell(-1, 11, BorderType.Wrap),
                bias: 40,
                cat: AuxPointCategory.Usb3,
                name: AuxPointType.U3Analog2
            });
        }

        for (const point of this._aux_points.values()) {
            if (Array.isArray(point)) continue;

            if (!this._aux_points.has(point.idx.x)) {
                this._aux_points.set(point.idx.x, []);
            }

            const item = this._aux_points.get(point.idx.x);

            if (Array.isArray(item)) {
                item[point.idx.y] = point;
            }
        }
    }

    private _initVirtualPoints(domains: DomainDecl[]) {
        if (!domains) return;

        for (const domain of domains) {
            if (domain.virtual) {
                const coord_list = pointseq(domain.virtual);

                this._virtual_points.push(...coord_list);
            }
        }
    }

    private _declsToDomains(ddecls: DomainDecl[]): DomainTable {
        const table: DomainTable = {};
        let id = 0;

        for (const decl of ddecls) {
            const domains = this._declToDomains(decl);
            for (const domain of domains) {
                table[id++] = domain;
            }
        }

        return table;
    }

    private _declToDomains(decl: DomainDecl): Domain[] {
        let domains: Domain[] = [];

        let slices: XYRange[] = [];

        const fld = rangeOrPointToRange(decl.field);
        const from = this.getCell(fld.from.x, fld.from.y, BorderType.Wrap).idx;
        const to = this.getCell(fld.to.x, fld.to.y, BorderType.Wrap).idx;

        if (decl.field.hasOwnProperty("x") && decl.field.hasOwnProperty("y")) {
            slices = [rangeOrPointToRange(from)];
        } else {
            slices.push(...sliceXYRange({ from, to }, decl.slice));
        }

        for (const slice of slices) {
            isFixedXY(slice);

            domains.push({
                field: slice,
                virtual: decl.virtual,
                minus: decl.minus,
                props: { ...decl.props }
            });
        }

        return domains;
    }

    /**
     * Returns number of occupied cells
     */
    private _howMuchOccupied() {
        let how = 0;

        for (let i = 0; i < this.dim.x; i++) {
            for (let j = 0; j < this.dim.y; j++) {
                if (this._cells[i][j].occupied) how++;
            }
        }

        return how;
    }
}

function getVoltageSourcePlate(coords_minus: XYPoint, coords_vcc: XYPoint): EmbeddedPlate {
    return {
        type: "Vss",
        id: -100,
        position: {
            cells: [coords_minus, coords_vcc]
        },
        properties: {
            volt: 5
        }
    };
}

function getArduinoPinPlate(
    arduino_node: XYPoint,
    minus_node: XYPoint,
    pin_state_initial: PinState,
    ard_plate_ser_num: number
): EmbeddedPlate {
    return {
        type: "ard_pin",
        id: -101 - ard_plate_ser_num++,
        position: {
            cells: [
                { x: arduino_node.x, y: arduino_node.y },
                { x: minus_node.x, y: minus_node.y }
            ]
        },
        properties: {
            volt: 5,
            analogue_max_value: 100
        },
        pin_state_initial
    };
}
