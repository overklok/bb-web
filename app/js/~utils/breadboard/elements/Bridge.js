import BBElement from "../core/BBElement";

class Bridge extends BBElement {
    constructor(container, cells) {
        super(container);

        this.cells = cells;

        switch (this.cells) {
            case 1:
                this.path_origin = [
                    ['M', 0, 0],
                    ['l', 2, 0],
                    ['c', 0, 0],
                    [2, 3],
                    [4, 0],
                    ['l', 2, 0]
                ];
                break;

            case 2:
                this.path_origin = [
                    ['M', 0, 0],
                    ['l', 1, 0],
                    ['c', 0, 0],
                    [2, 2],
                    [4, 0],
                    ['l', 1, 0]
                ];
                break;

            case 3:
                this.path_origin = [
                    ['M', 0, 0],
                    ['l', 0.5, 0],
                    ['c', 0, 0],
                    [2, 1],
                    [4, 0],
                    ['l', 0.5, 0]
                ];
                break;
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

            this.bias.x         = dot_inp.x;
            this.bias.y         = Math.min(dot_inp.y, dot_out.y) + GRID_DOT_SIZE;

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