const ORIENT = {
    HORZ: 0,
    VERT: 1
};

let lastId = 0;

class BBElement {
    constructor(container) {
        this.container = container;

        this.path_origin = [];

        this.input_origin   = {};
        this.output_origin  = {};

        this.inputs     = [];
        this.outputs    = [];

        this.size = undefined;
        this.orientation = undefined;
        this.bias = {};

        this.id = lastId++;
    }

    /**
     * Нарисовать элемент
     *
     * @param dot_inp   Координаты входной точки в пикселях
     * @param dot_out   Координаты выходной точки в пикселях
     *
     * @abstract
     */
    draw(dot_inp, dot_out) {
        throw new TypeError("Element.draw(): This method should be overridden by ingeriting classes")
    };

    /**
     * Достроить SVG-контур тока
     *
     * @param path исходный контур тока
     * @returns bool достроил ли генератор SVG-контур
     */
    appendCurrentPath(path) {
        //TODO: учитвать отстутствие in, out

        if (this.inputs.length === 1 && this.outputs.length === 1) {
            if (this.orientation === ORIENT.VERT) {
                path.push(['m', 0, -this.size]);
            }
            if (this.orientation === ORIENT.HORZ) {
                path.push(['m', this.size, 0]);
            }

            return true;
        }

        return false;
    };

    /**
     * Добавить к объекту входную точку (ток)
     *
     * @param dot координаты точки в пикселях
     */
    addInput = function (dot) {
        if (this.input_origin.x === dot.x && this.input_origin.y === dot.y) {
            this.inputs.push(dot);
        }
    };

    /**
     * Добавить к объекту выходную точку (ток)
     *
     * @param dot координаты точки в пикселях
     */
    addOutput = function (dot) {
        if (this.output_origin.x === dot.x && this.output_origin.y === dot.y) {
            this.outputs.push(dot);
        }
    };

    /**
     * Удалить все входные и выхоные точки
     */
    removeIOs = function () {
        this.inputs  = [];
        this.outputs = [];
    };
}

export default BBElement;