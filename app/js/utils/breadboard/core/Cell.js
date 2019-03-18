export default class Cell {
    constructor(x, y, grid) {
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
            }
        };

        this.__grid = grid;

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

    get pos() {
        return this._params.pos;
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
}