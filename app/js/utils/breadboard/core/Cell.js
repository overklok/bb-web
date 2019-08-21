const DIRECTIONS = {
    Up:     'up',
    Down:   'down',
    Left:   'left',
    Right:  'right',
};

const DIRS_CW = [DIRECTIONS.Up, DIRECTIONS.Right, DIRECTIONS.Down, DIRECTIONS.Left];

export default class Cell {
    static get Directions() {return DIRECTIONS}
    static get DirectionsClockwise() {return DIRS_CW}

    constructor(x, y, grid, track=null) {
        if (typeof x === "undefined") {
            throw new TypeError("X is not defined");
        }

        if (typeof y === "undefined") {
            throw new TypeError("Y is not defined");
        }

        if (!grid) {
            throw new TypeError("Grid is not defined");
        }

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

        this.__grid = grid;

        this.__opp = undefined;
        this.__adj = undefined;

        this._validate();
        this._calculate();
    }

    get idx() {
        return this._params.idx;
    }

    get size() {
        return this._params.size;
    }

    get rel() {
        return this._params.rel;
    }

    get track() {
        return this._params.track;
    }

    get pos() {
        return this._params.pos;
    }

    get adj() {
        let adj = this.__adj ? this.__adj : {x: 0, y: 0};

        return {x: adj.x * this.size.x, y: adj.y * this.size.y}
    }

    get opp() {
        return this.__opp;
    }

    get center() {
        return {
            x: this._params.pos.x + this._params.size.x / 2,
            y: this._params.pos.y + this._params.size.y / 2
        }
    }

    get center_rel() {
        return {
            x: this._params.rel.x + this._params.size.x / 2,
            y: this._params.rel.y + this._params.size.y / 2
        }
    }

    get center_adj() {
        return {
            x: this.center.x + this.adj.x,
            y: this.center.y + this.adj.y
        }
    }

    get occupied() {
        return (this.__adj != null || this.__opp != null);
    }

    isAt(x=null, y=null) {
        if (x === null && y === null) throw new TypeError("One of (x, y) must be no null");

        if (x === -1) x = this.__grid.dim.x - 1;
        if (y === -1) y = this.__grid.dim.y - 1;

        if (x === null) return this.idx.y === y;
        if (y === null) return this.idx.x === x;

        return (this.idx.x === x && this.idx.y === y);
    }

    neighbor(dir) {
        let point = {};

        switch (dir) {
            case Cell.Directions.Up: {
                point = {x: this.idx.x, y: this.idx.y - 1}; break;
            }
            case Cell.Directions.Down: {
                point = {x: this.idx.x, y: this.idx.y + 1}; break;
            }
            case Cell.Directions.Right: {
                point = {x: this.idx.x + 1, y: this.idx.y}; break;
            }
            case Cell.Directions.Left: {
                point = {x: this.idx.x - 1, y: this.idx.y}; break;
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }

        try {
            return this.__grid.cell(point.x, point.y);
        } catch (err) {
            return null;
        }
    }

    reoccupy(adjustment=null, opp=null) {
        this.__adj = adjustment;
        this.__opp = opp;
    }

    _calculate() {
        this._params.size = {
            x: (this.__grid.size.x / this.__grid.dim.x) - (this.__grid.gap.x * 2),
            y: (this.__grid.size.y / this.__grid.dim.y) - (this.__grid.gap.y * 2)
        };

        this._params.rel = {
            x: ((this.__grid.size.x / this.__grid.dim.x) * this._params.idx.x),
            y: ((this.__grid.size.y / this.__grid.dim.y) * this._params.idx.y),
        };

        this._params.pos = {
            x: this.__grid.pos.x + this._params.rel.x,
            y: this.__grid.pos.y + this._params.rel.y,
        };
    };

    _validate() {
        if (this._x < 0 || this._y < 0 || this._x >= this.__grid.dim.x || this._y >= this.__grid.dim.y) {
            throw new RangeError("This cell is not valid: coordinates is out of grid's range");
        }
    }

    static IsDirHorizontal(dir) {
        return (dir === Cell.Directions.Up || dir === Cell.Directions.Down);
    }

    static IsDirVertical(dir) {
        return (dir === Cell.Directions.Left || dir === Cell.Directions.Right);
    }

    static IsDirsClockwise(dir1, dir2) {
        let dir_idx_1 = DIRS_CW.indexOf(dir1),
            dir_idx_2 = DIRS_CW.indexOf(dir2);

        if (dir_idx_1 === -1 || dir_idx_2 === -1) {
            throw new RangeError("Invalid direction(s)");
        }

        return ((dir_idx_2 - dir_idx_1 === 1) || (dir_idx_1 === (DIRS_CW.length - 1) && dir_idx_2 === 0));
    }
}