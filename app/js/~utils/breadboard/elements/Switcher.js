import BBElement from "../core/BBElement";

const SWITCHER_STATE = {
    CLOSED: 0,
    OPENED: 1
};

class Switcher extends BBElement {
    constructor(container, state) {
        super(container);

        if (typeof state === 'undefined') {
            state = SWITCHER_STATE.CLOSED;
        }

        this.state = state;

        if (this.state === SWITCHER_STATE.CLOSED) {
            this.path_origin = [
                ['M', 0, 0],
                ['l', 4, 4],
                ['l', 28, 0],
                ['l', 4, -4],
                ['m', -4, 4],
                ['m', -14, 0],
                ['l', 0, -4],
                ['z']
            ];
        } else {
            this.path_origin = [
                ['M', 0, 0],
                ['l', 4, 4],
                ['l', 4, 0],
                ['l', 4, 4],
                ['m', 0, -4],
                ['l', 20, 0],
                ['l', 4, -4],
                ['m', -4, 4],
                ['m', -14, 0],
                ['l', 0, -4],
                ['z']
            ];
        }
    }

    draw(dot_inp, dot_out) {
        if (dot_inp.y === dot_out.y) {
            /// Если элемент расположен вдоль оси X
            this.orientation    = ORIENT.HORZ;

            this.size           = Math.abs(dot_out.x - dot_inp.x);

            this.bias.x         = Math.min(dot_inp.x, dot_out.x) + GRID_DOT_SIZE/2;
            this.bias.y         = dot_inp.y + GRID_DOT_SIZE/2;
        } else if (dot_inp.x === dot_out.x) {
            /// Если элемент расположен вдоль оси Y
            this.orientation    = ORIENT.VERT;
            this.size           = Math.abs(dot_out.y - dot_inp.y);

            this.bias.x         = dot_inp.x - GRID_DOT_SIZE * 1.5;
            this.bias.y         = Math.min(dot_inp.y, dot_out.y) + GRID_DOT_SIZE * 2;
        } else {
            console.warn('[' + this.constructor.name + ']: coordinate error');
            return null;

        }

        let path = this.container.path(this.path_origin).stroke({width: 2}).fill('none');

        if (this.orientation === ORIENT.VERT) {
            path.move(this.bias.x, this.bias.y);
            path.rotate(90);
            path.size(this.size);
        } else {
            path.move(this.bias.x, this.bias.y);
            // не вращать
            path.size(this.size);
        }

        this.input_origin = dot_inp;
        this.output_origin = dot_out;
    };
}

export default Switcher;