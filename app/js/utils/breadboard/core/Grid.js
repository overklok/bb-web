import Current from './Current';
import Cell from "./Cell";

const GRID_DOT_SIZE = 0;           // Радиус точек
const GRID_DOT_BEZEL_SIZE = 40;    // Размер окантовки точки

//TODO: сделать градиент, по центру - белый, по бокам - синий, со свечением
const CURRENT_COLOR_GOOD    = '#7DF9FF';    // Цвет тока здорового человека
const CURRENT_COLOR_BAD     = '#f00';       // Цвет тока курильщика



/**
 * Класс "Сетка"
 */
export default class Grid {
    constructor(rows, cols, width, height, gap_x=0, gap_y=0) {
        if (!rows || !cols || !width || !height) {
            throw new TypeError("All arguments should be defined");
        }
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

    get cells() {
        return this._cells;
    }

    cell(i, j) {
        if (!Number.isInteger(i) || !Number.isInteger(j)) {
            throw new TypeError("Indices must be integers");
        }

        if (!(i in this._cells) && (!(j in this._cells[i]))) {
            throw new RangeError("Coordinates of cell is out of grid's range");
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
                this._cells[i][j] = new Cell(i, j, this);
            }
        }
    };
}
