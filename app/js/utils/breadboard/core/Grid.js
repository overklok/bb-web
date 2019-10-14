import Current from './Current';
import Cell from "./Cell";

const BORDER_TYPES = {
    None: 'none',
    Replicate: 'replicate',
    Reflect: 'reflect',
    Wrap: 'wrap',
};

/**
 * Класс "Сетка"
 */
export default class Grid {
    static get BorderTypes() {return BORDER_TYPES}

    constructor(rows, cols, width, height, pos_x=0, pos_y=0, gap_x=0, gap_y=0) {
        if (rows == null || cols == null || width == null || height == null) {
            throw new TypeError("All required arguments should be defined");
        }

        if (rows <= 0 || cols <= 0)     throw new RangeError("Row/Column count should be positive values");
        if (width <= 0 || height <= 0)  throw new RangeError("Width/Height should be positive values");
        if (pos_x < 0 || pos_y < 0)     throw new RangeError("Position X/Y should be non-negative values");
        if (gap_x < 0 || gap_y< 0)      throw new RangeError("Gap X/Y should be non-negative values");

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
            }
        };

        /// Ячейки сетки
        this._cells = [];
        this._createCells();
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
