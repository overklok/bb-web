import BBElement from "../core/BBElement";

class Diode extends BBElement {
    constructor(container) {
        super(container);

        this.path_origin = [
            ['M',  0, 0 ],
            ['l',  2, 2 ],
            ['l',  2, 0 ],
            ['m',  0, 2 ],
            ['l',  0, -4 ],
            ['l',  2, 2 ],
            ['l',  -2, 2 ],
            ['m',  2, -4 ],
            ['l',  0, 4 ],
            ['m',  0, -2 ],
            ['l',  2, 0 ],
            ['l',  2, -2 ]
        ];

        this.path_origin_inverted = [
            ['M',  0, 0 ],
            ['l',  2, -2 ],
            ['l',  2, 0 ],
            ['m',  0, 2 ],
            ['l',  0, -4 ],
            ['l',  2, 2 ],
            ['l',  -2, 2 ],
            ['m',  2, -4 ],
            ['l',  0, 4 ],
            ['m',  0, -2 ],
            ['l',  2, 0 ],
            ['l',  2, 2 ]
        ];
    }

    draw(dot_inp, dot_out) {

        let reverse = false;

        if (dot_inp.y === dot_out.y) {
            /// Если элемент расположен по оси X
            if (dot_inp.x > dot_out.x) {
                reverse = true;
            }

            this.orientation    = ORIENT.HORZ;

            this.size           = Math.abs(dot_out.x - dot_inp.x);

            this.bias.x         = Math.min(dot_inp.x, dot_out.x) + GRID_DOT_SIZE/2;
            this.bias.y         = dot_inp.y + GRID_DOT_SIZE/2;

        } else if (dot_inp.x === dot_out.x) {
            /// Если элемент расположен по оси Y
            if (dot_inp.y > dot_out.y) {
                reverse = true;
            }

            this.orientation    = ORIENT.VERT;
            this.size           = Math.abs(dot_out.y - dot_inp.y);

            this.bias.x         = dot_inp.x - GRID_DOT_SIZE/2;
            this.bias.y         = Math.min(dot_inp.y, dot_out.y) + GRID_DOT_SIZE;

        } else {
            /// Если элемент расположен неправильно
            console.warn('[' + this.constructor.name + ']: coordinate error');
            return null;
        }

        if (reverse) {
            let path = this.container.path(this.path_origin_inverted).stroke({width: 2}).fill('none');
        } else {
            let path = this.container.path(this.path_origin).stroke({width: 2}).fill('none');
        }

        if (this.orientation === ORIENT.VERT) {
            path.move(this.bias.x, this.bias.y);
            path.rotate(90);
            path.size(this.size);
        } else {
            path.move(this.bias.x, this.bias.y);
            // не вращать
            path.size(this.size);
        }

        if (reverse === true) {
            if (this.orientation === ORIENT.VERT) {
                path.rotate(90+180);
            } else {
                path.rotate(180);
            }
        }

        this.input_origin = dot_inp;
        this.output_origin = dot_out;
    };
}