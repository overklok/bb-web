import Grid from "./Grid";
import {Direction, DirsClockwise, XYObject} from "./types";

export type CellData = {
    voltage: number;
}

/**
 * Logical representation of single board cell.
 * Cell does not make any drawing, it just manages the data 
 * about its size, position and relations with another Cells with respect to given {@link Grid}.
 * 
 * @category Breadboard
 */
export default class Cell {
    /* the Grid instance this Cell belongs to */
    public readonly grid: Grid;

    /* set of fixed parameters for the Cell */
    private readonly _params: {
        idx: XYObject,
        size: XYObject,
        rel: XYObject,
        pos: XYObject,
        track: string
    }

    /** optional adjacent cell from the same {@link Grid} */
    private __adj: XYObject;

    /** optional opposite cell from the same {@link Grid} */
    private __opp: Cell;
    private _data: CellData;

    /**
     * Create Cell instance
     *
     * @param x     First (horizontal) index of Cell in the {@link Grid}
     * @param y     Second (vertical) index of Cell in the {@link Grid}
     * @param grid  the Grid instance this Cell should belong to
     * @param track [Deprecated] Grid's track identifier to keep in the cell.
     *              Track is a group of connected cells that can have a special identifier
     */
    constructor(x: number, y: number, grid: Grid, track: string = null) {
        this._params = {
            idx: {
                x: x,
                y: y,
            },
            size: {
                x: undefined,
                y: undefined,
            },
            rel: {
                x: undefined,
                y: undefined,
            },
            pos: {
                x: undefined,
                y: undefined,
            },
            track: track
        };

        this.grid = grid;

        this.__opp = undefined;
        this.__adj = undefined;

        this.validate();
        this.calculate();
    }

    /**
     * Board indices within the {@link Grid}.
     * First index, `x`, is the vertical position in the array of Cells.
     * Second index, `y`, is the horizontal position.
     */
    get idx(): XYObject {
        return {...this._params.idx};
    }

    /**
     * Geometric size of the {@link Cell} in pixels.
     * `x` corresponds to width, `y` is height of the cell.
     */
    get size(): XYObject {
        return {...this._params.size};
    }

    /**
     * Geometric position of the {@link Cell} relative to the geometrical {@link Grid} position.
     */
    get rel(): XYObject {
        return {...this._params.rel};
    }

    /**
     * Absolute geometric position of the {@link Cell} in the document.
     */
    get pos(): XYObject {
        return {...this._params.pos};
    }

    /**
     * Absolute geometric position of the {@link Cell}'s center
     */
    get center(): XYObject {
        return {
            x: this._params.pos.x + this._params.size.x / 2,
            y: this._params.pos.y + this._params.size.y / 2
        }
    }

    /**
     * Relative geometric position of the {@link Cell}'s center
     */
    get center_rel(): XYObject {
        return {
            x: this._params.rel.x + this._params.size.x / 2,
            y: this._params.rel.y + this._params.size.y / 2
        }
    }

    /**
     * Name of the track of the {@link Grid} the {@link Cell} does belong to
     */
    get track(): string {
        return this._params.track;
    }

    /**
     * Geometric position of the {@link Cell}'s adjustment point
     */
    get adj(): XYObject {
        let adj = this.__adj ? this.__adj : {x: 0, y: 0};

        return {x: adj.x * this.size.x, y: adj.y * this.size.y}
    }

    /**
     * Geometric position of the {@link Cell}'s adjustment point center
     */
    get center_adj(): XYObject {
        return {
            x: this.center.x + this.adj.x,
            y: this.center.y + this.adj.y
        }
    }

    /**
     * Cell that is opposite to the {@link Cell}
     */
    get opp(): Cell {
        return this.__opp;
    }

    /**
     * Whether the {@link Cell} is occupied by the opposite Cell or has an adjustment point
     */
    get occupied(): boolean {
        return (this.__adj != null || this.__opp != null);
    }

    public setData(data: CellData) {
        this._data = {...this._data, ...data};
    }

    /**
     * Returns whether the {@link Cell} is located at the given coordinates
     *
     * At least one of the `x`, `y` parameters should be defined.
     *
     * If `x` is `null`, only `y` value will be validated.
     * If `y` is `null`, only `x` value will be validated.
     *
     * Both of `x` and `y` can be negative: in this case, it will be treated as a reversed index
     * from the end of the corresponding {@link Grid} dimension.
     *
     * @param x optional `x` index of the {@link Grid} this {@link Cell} does belong to
     * @param y optional `y` index of the {@link Grid} this {@link Cell} does belong to
     */
    public isAt(x: number = null, y: number = null): boolean {
        if (x === null && y === null) throw new TypeError("One of (x, y) must be not null");

        if (x === -1) x = this.grid.dim.x - 1;
        if (y === -1) y = this.grid.dim.y - 1;

        if (x === null) return this.idx.y === y;
        if (y === null) return this.idx.x === x;

        return (this.idx.x === x && this.idx.y === y);
    }

    /**
     * Returns the neighbor of the {@link Cell} in the given {@link Direction}
     *
     * For boundary {@link Cell}s it's not possible to find a neighbor in some directions, so
     * an exception will be thrown.
     *
     * @param dir {@link Direction} in which adjacent {@link Cell} will be returned
     */
    public neighbor(dir: Direction) {
        let point: XYObject = {x: undefined, y: undefined};

        switch (dir) {
            case Direction.Up: {
                point = {x: this.idx.x, y: this.idx.y - 1}; break;
            }
            case Direction.Down: {
                point = {x: this.idx.x, y: this.idx.y + 1}; break;
            }
            case Direction.Right: {
                point = {x: this.idx.x + 1, y: this.idx.y}; break;
            }
            case Direction.Left: {
                point = {x: this.idx.x - 1, y: this.idx.y}; break;
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }

        try {
            return this.grid.cell(point.x, point.y);
        } catch (err) {
            return null;
        }
    }

    /**
     * Reoccupies the cell by settings given adjustment point and opposite cell
     *
     * Cell occupation is needed to simplify finding {@link Cell}s placed under the {@link Plate}'
     * Each time {@line Plate} is moved or rotated, it reoccupies its relative cells.
     * For {@link Plate}s that have at least two points of their surface, it's also needed
     * to reoccupy when rotated.
     *
     * Each {@link Cell} may have a paired `opposite` {@link Cell} from the same {@link Grid} for
     * commutation when drawing {@link Current}s.
     *
     * An adjustment may be required to store in the {@link Cell} to draw currents
     * from points different than its center.
     *
     * Both of `opposite` and `adjustment` parameters can be used to help illustrate
     * the current flow through the plate.
     *
     * @param adjustment    deviation from standard geometric position of the {@link Cell}
     * @param opposite      paired {@link Cell} from which the current will go
     */
    public reoccupy(adjustment: XYObject = null, opposite: Cell = null) {
        this.__adj = adjustment;
        this.__opp = opposite;
    }

    /**
     * Calculates fixed parameters of the {@link Cell}
     *
     * @private
     */
    private calculate() {
        this._params.size = {
            x: (this.grid.size.x / this.grid.dim.x) - (this.grid.gap.x * 2),
            y: (this.grid.size.y / this.grid.dim.y) - (this.grid.gap.y * 2)
        };

        this._params.rel = {
            x: ((this.grid.size.x / this.grid.dim.x) * this._params.idx.x),
            y: ((this.grid.size.y / this.grid.dim.y) * this._params.idx.y),
        };

        this._params.pos = {
            x: this.grid.pos.x + this._params.rel.x,
            y: this.grid.pos.y + this._params.rel.y,
        };
    };

    /**
     * Checks if the properties of the {@link Cell} do not contradict {@link Grid} properties.
     *
     * @private
     * @throws RangeError
     */
    private validate() {
        if (this.idx.x < 0 || this.idx.y < 0 || this.idx.x >= this.grid.dim.x || this.idx.y >= this.grid.dim.y) {
            throw new RangeError("This cell is not valid: coordinates is out of grid's range");
        }
    }

    /**
     * Returns whether the line formed by two {@link Cell}s does belong to the row / column index
     *
     * Either `x` or `y` might be specified at once, so diagonal lines will not give `true`.
     *
     * @static
     *
     * @param cell_from a first {@link Cell} the index position of which belongs to the line
     * @param cell_to   a second {@link Cell} the index position of which belongs to the line
     * @param x         horizontal index (column) for that the line will be tested
     * @param y         vertical index (row) for that the line will be tested
     * 
     * @throws RangeError
     */
    static IsLineAt(cell_from: Cell, cell_to: Cell, x: number = null, y: number = null): boolean {
        if ((x !== null && y !== null) || (x === null && y === null)) {
            throw new RangeError("Either 'x' or 'y' should be defined only");
        }

        return cell_from.isAt(x, y) && cell_to.isAt(x, y);
    }

    /**
     * @static
     * 
     * Returns whether is line formed by tho cell points is vertical
     *
     * @param cell_from
     * @param cell_to
     * 
     * @throws RangeError
     */
    static IsLineVertical(cell_from: Cell, cell_to: Cell): boolean {
        return cell_from.idx.x === cell_to.idx.x;
    }

    /**
     * Returns whether is line formed by tho cell points is horizontal
     * 
     * @param cell_from 
     * @param cell_to 
     */
    static IsLineHorizontal(cell_from: Cell, cell_to: Cell) {
        return cell_from.idx.y === cell_to.idx.y;
    }

    /**
     * Returns whether the given {@line Direction} is horizontal 
     * @param dir 
     */
    static IsDirHorizontal(dir: Direction): boolean {
        return (dir === Direction.Up || dir === Direction.Down);
    }

    /**
     * Returns whether the given {@line Direction} is vertical 
     * 
     * @param dir 
     */
    static IsDirVertical(dir: Direction) {
        return (dir === Direction.Left || dir === Direction.Right);
    }

    /**
     * Returns whether the sequence of two {@link Direction}s is clockwise-ordered
     * 
     * @param dir1 
     * @param dir2 
     */
    static IsDirsClockwise(dir1: Direction, dir2: Direction) {
        let dir_idx_1 = DirsClockwise.indexOf(dir1),
            dir_idx_2 = DirsClockwise.indexOf(dir2);

        if (dir_idx_1 === -1 || dir_idx_2 === -1) {
            throw new RangeError("Invalid direction(s)");
        }

        return ((dir_idx_2 - dir_idx_1 === 1) || (dir_idx_1 === (DirsClockwise.length - 1) && dir_idx_2 === 0));
    }
}