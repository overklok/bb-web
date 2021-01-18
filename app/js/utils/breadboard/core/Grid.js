import Current from './Current';
import Cell from "./Cell";
import {boundsToCoordList, pointsToCoordList} from "./extras/helpers";

const BORDER_TYPES = {
    None: 'none',
    Replicate: 'replicate',
    Reflect: 'reflect',
    Wrap: 'wrap',
};

const AUX_POINTS = {
    Vcc: 'vcc',
    Gnd: 'gnd',

    U1Vcc:      'u1_vcc',
    U1Gnd:      'u1_gnd',
    U1Analog1:  'u1_a1',
    U1Analog2:  'u1_a2',

    U3Vcc:      'u3_vcc',
    U3Gnd:      'u3_gnd',
    U3Analog1:  'u3_a1',
    U3Analog2:  'u3_a2',
};

const AUX_POINT_CATEGORIES = {
    SourceV5: 'source-v5',
    SourceV8: 'source-v8',
    Usb1: 'usb1',
    Usb3: 'usb3',
};

/**
 * Класс "Сетка"
 */
export default class Grid {
    static get BorderTypes() {return BORDER_TYPES}
    static get AuxPoints() {return AUX_POINTS}
    static get AuxPointCats() {return AUX_POINT_CATEGORIES}

    constructor(
        rows, cols,
        width, height,
        pos_x=0, pos_y=0,
        gap_x=0, gap_y=0,
        wrap_x=0, wrap_y = 0,
        aux_points_categories=null,
        domains=null,
        curr_straight_top_y=null,
        curr_straight_bottom_y=null
    ) {
        if (rows == null || cols == null || width == null || height == null) {
            throw new TypeError("All required arguments should be defined");
        }

        if (rows <= 0 || cols <= 0)     throw new RangeError("Row/Column count should be positive values");
        if (width <= 0 || height <= 0)  throw new RangeError("Width/Height should be positive values");
        if (pos_x < 0 || pos_y < 0)     throw new RangeError("Position X/Y should be non-negative values");
        if (gap_x < 0 || gap_y < 0)     throw new RangeError("Gap X/Y should be non-negative values");
        if (wrap_x < 0 || wrap_y < 0)   throw new RangeError("Wrap X/Y should be non-negative values");

        /// Размер сетки
        this._params = {
            dim: {
                x: cols,
                y: rows
            },
            size: {
                x: width,
                y: height
            },
            gap: {
                x: gap_x,
                y: gap_y
            },
            pos: {
                x: pos_x,
                y: pos_y
            },
            wrap: {
                x: wrap_x,
                y: wrap_y
            }
        };

        this.curr_straight_top_y = curr_straight_top_y;
        this.curr_straight_bottom_y = curr_straight_bottom_y;

        this._aux_points_cats = aux_points_categories || [];

        /// Ячейки сетки
        this._cells = [];
        this._aux_points = {};
        this._virtual_points = [];
        this._createCells();
        this._initAuxPoints();
        this._initVirtualPoints(domains);
    }

    get dim() {
        return this._params.dim;
    }
    
    get size() {
        return this._params.size;
    }

    get gap() {
        return this._params.gap;
    }

    get pos() {
        return this._params.pos;
    }

    get wrap() {
        return this._params.wrap;
    }

    get cells() {
        return this._cells;
    }

    getCellByPos(x, y, border_type) {
        let ix = Math.floor((x - this.pos.x) / this.size.x * this.dim.x);
        let iy = Math.floor((y - this.pos.y) / this.size.y * this.dim.y);

        if (ix < 0) ix = 0;
        if (ix > this.dim.x - 1) ix = this.dim.x - 1;

        if (iy < 0) iy = 0;
        if (iy > this.dim.y - 1) iy = this.dim.y - 1;

        return this.cell(ix, iy, border_type);
    }

    /**
     * Выдать конкретную ячейку из сетки
     *
     * @param i номер строки
     * @param j номре столбца
     * @param border_type тип границы
     *
     * Доступно несколько типов границ, устанавливающих поведение функции при выходе за границы сетки:
     *  - Grid.BorderType.None      (выход за границы запрещён)
     *  - Grid.BorderType.Replicate (индексы элементов равны граничным)
     *  - Grid.BorderType.Reflect   (индексы элементов зеркально отражаются)
     *  - Grid.BorderType.Wrap      (индексы элементов циклически повторяются)
     *
     * @returns {Cell}
     */
    cell(i, j, border_type=Grid.BorderTypes.None) {
        if (!Number.isInteger(i) || !Number.isInteger(j)) {
            throw new TypeError("Indices must be integers");
        }

        switch (border_type) {
            case Grid.BorderTypes.Replicate: {
                i = (i < 0) ? 0 : i;    i = (i >= this._params.dim.x) ? (this._params.dim.x - 1) : i;
                j = (j < 0) ? 0 : j;    j = (j >= this._params.dim.y) ? (this._params.dim.y - 1) : j;
                break;
            }
            case Grid.BorderTypes.Reflect: {
                // TODO: Not needed yet
                break;
            }
            case Grid.BorderTypes.Wrap: {
                i = (i < 0) ? (i % this._params.dim.x) + this._params.dim.x : (i % this._params.dim.x);
                j = (j < 0) ? (j % this._params.dim.y) + this._params.dim.y : (j % this._params.dim.y);
                break;
            }
        }

        if (!(i in this._cells) || (!(j in this._cells[i]))) {
            throw new RangeError("Coordinates of cell is out of grid's range" + `: ${i}, ${j}`);
        }

        return this._cells[i][j];
    }

    auxPoint(i, j=null) {
        try {
            if (typeof i === 'string') {
                return this._aux_points[i];
            }

            return this._aux_points[i][j];
        } catch (TypeError) {
            return undefined;
        }
    }

    virtualPoint(x, y) {
        if (!this._virtual_points) return;

        for (const point of this._virtual_points) {
            if (!point) continue;

            if (point.x === x && point.y === y) {
                return point;
            }
        }

        return undefined;
    }

    isAuxPointCatRequired(cat) {
        return this._aux_points_cats.indexOf(cat) !== -1;
    }

    /**
     * Расположить ячейки сетки
     *
     * @private
     */
    _createCells() {
        // Массив ссылок на отрисованные точки
        this._cells = [];

        for (let i = 0; i < this.dim.x; i++) {
            this._cells[i] = [];

            for (let j = 0; j < this.dim.y; j++) {
                this._cells[i][j] = new Cell(i, j, this, this._getTrackOfCell(i, j));
            }
        }
    };

    /**
     * Определить дорожку, на которой установлена ячейка
     *
     * @param i
     * @param j
     * @returns {string}
     * @private
     */
    _getTrackOfCell(i, j) {
        if (j === 1)                return "h0";
        if (j === this.dim.y-1)     return "h1";

        if (j >= 2 && j <= 5) {return "vt" + i;}
        if (j >= 6 && j <= 9) {return "vb" + i;}
    }

    _initAuxPoints() {
        const celldist_y = this.cell(0, 1).pos.y - this.cell(0, 0).pos.y;

        if (this.isAuxPointCatRequired(Grid.AuxPointCats.SourceV5)) {
            const source_center = {
                x: 80,
                y: this.cell(0, 5).center.y + celldist_y / 2
            };

            this._aux_points[Grid.AuxPoints.Vcc] = {
                idx: {x: -1, y: 1},
                pos: {x: source_center.x, y: source_center.y - 20},
                cell: this.cell(0, 1, Grid.BorderTypes.Wrap),
                cat: Grid.AuxPointCats.SourceV5,
                name: Grid.AuxPoints.Vcc
            };

            this._aux_points[Grid.AuxPoints.Gnd] = {
                idx: {x: -1, y: this.dim.y - 1},
                pos: {x: source_center.x, y: source_center.y + 20},
                cell: this.cell(0, -1, Grid.BorderTypes.Wrap),
                cat: Grid.AuxPointCats.SourceV5,
                name: Grid.AuxPoints.Gnd
            };
        }

        if (this.isAuxPointCatRequired(Grid.AuxPointCats.SourceV8)) {
            const source_center = {
                x: 80,
                y: this.cell(0, 8).center.y + celldist_y / 2
            };

            this._aux_points[Grid.AuxPoints.Vcc] = {
                idx: {x: -1, y: 0},
                pos: {x: source_center.x, y: source_center.y - 20},
                cell: this.cell(0, 0, Grid.BorderTypes.Wrap),
                cat: Grid.AuxPointCats.SourceV8,
                name: Grid.AuxPoints.Vcc
            };

            this._aux_points[Grid.AuxPoints.Gnd] = {
                idx: {x: -1, y: this.dim.y - 1},
                pos: {x: source_center.x, y: source_center.y + 20},
                cell: this.cell(0, -1, Grid.BorderTypes.Wrap),
                cat: Grid.AuxPointCats.SourceV8,
                name: Grid.AuxPoints.Gnd
            };
        }

        // USB1

        if (this.isAuxPointCatRequired(Grid.AuxPointCats.Usb1)) {
            const usb1_center = {
                // take border width into account
                x: this.wrap.x - 5,
                y: this.cell(0, 4).center.y + celldist_y / 2
            };

            this._aux_points[Grid.AuxPoints.U1Vcc] = {
                idx: {x: 8, y: 3},
                pos: {x: usb1_center.x, y: usb1_center.y - 21},
                cell: this.cell(-1, 3, Grid.BorderTypes.Wrap),
                bias: 20,
                cat: Grid.AuxPointCats.Usb1,
                name: Grid.AuxPoints.U1Vcc
            };

            this._aux_points[Grid.AuxPoints.U1Gnd] = {
                idx: {x: 8, y: 6},
                pos: {x: usb1_center.x, y: usb1_center.y + 21},
                cell: this.cell(-1, 6, Grid.BorderTypes.Wrap),
                bias: 20,
                cat: Grid.AuxPointCats.Usb1,
                name: Grid.AuxPoints.U1Gnd
            };

            this._aux_points[Grid.AuxPoints.U1Analog1] = {
                idx: {x: 8, y: 4},
                pos: {x: usb1_center.x, y: usb1_center.y - 7},
                cell: this.cell(-1, 4, Grid.BorderTypes.Wrap),
                bias: 40,
                cat: Grid.AuxPointCats.Usb1,
                name: Grid.AuxPoints.U1Analog1
            };

            this._aux_points[Grid.AuxPoints.U1Analog2] = {
                idx: {x: 8, y: 5},
                pos: {x: usb1_center.x, y: usb1_center.y + 7},
                cell: this.cell(-1, 5, Grid.BorderTypes.Wrap),
                bias: 40,
                cat: Grid.AuxPointCats.Usb1,
                name: Grid.AuxPoints.U1Analog2
            };
        }

        // USB3

        if (this.isAuxPointCatRequired(Grid.AuxPointCats.Usb3)) {
            const usb3_center = {
                // take border width into account
                x: this.wrap.x - 5,
                y: this.cell(0, 10).center.y + celldist_y / 2
            };

            this._aux_points[Grid.AuxPoints.U3Vcc] = {
                idx: {x: 8, y: 9},
                pos: {x: usb3_center.x, y: usb3_center.y - 21},
                cell: this.cell(-1, 9, Grid.BorderTypes.Wrap),
                bias: 20,
                cat: Grid.AuxPointCats.Usb3,
                name: Grid.AuxPoints.U3Vcc
            };

            this._aux_points[Grid.AuxPoints.U3Gnd] = {
                idx: {x: 8, y: 12},
                pos: {x: usb3_center.x, y: usb3_center.y + 21},
                cell: this.cell(-1, 12, Grid.BorderTypes.Wrap),
                bias: 20,
                cat: Grid.AuxPointCats.Usb3,
                name: Grid.AuxPoints.U3Gnd
            };

            this._aux_points[Grid.AuxPoints.U3Analog1] = {
                idx: {x: 8, y: 10},
                pos: {x: usb3_center.x, y: usb3_center.y - 7},
                cell: this.cell(-1, 10, Grid.BorderTypes.Wrap),
                bias: 40,
                cat: Grid.AuxPointCats.Usb3,
                name: Grid.AuxPoints.U3Analog1
            };

            this._aux_points[Grid.AuxPoints.U3Analog2] = {
                idx: {x: 8, y: 11},
                pos: {x: usb3_center.x, y: usb3_center.y + 7},
                cell: this.cell(-1, 11, Grid.BorderTypes.Wrap),
                bias: 40,
                cat: Grid.AuxPointCats.Usb3,
                name: Grid.AuxPoints.U3Analog2
            };
        }

        for (const point of Object.values(this._aux_points)) {
            if (!(point.idx.x in this._aux_points)) {
                this._aux_points[point.idx.x] = [];
            }

            this._aux_points[point.idx.x][point.idx.y] = point;
        }
    }

    _initVirtualPoints(domains) {
        if (!domains) return;

        for (const domain of domains) {
            if (domain.virtual) {
                const coord_list = pointsToCoordList(domain.virtual.from, domain.virtual.to);

                this._virtual_points.push(...coord_list);
            }
        }
    }

    /**
     * @returns {number}
     * @private
     */
    _howMuchOccupied() {
        let how = 0;

        for (let i = 0; i < this.dim.x; i++) {
            for (let j = 0; j < this.dim.y; j++) {
                if (this._cells[i][j].occupied) how++;
            }
        }

        return how;
    }
}
