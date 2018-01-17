import BBElement from "../core/BBElement";

const BUTTON_STATE = {
    CLOSED: 0,
    OPENED: 1
};

class Button extends BBElement {
    constructor(container, state) {
        super(container);

        if (typeof state === 'undefined') {
            state = BUTTON_STATE.CLOSED;
        }

        this.state = state;

        if (this.state === BUTTON_STATE.CLOSED) {
            this.path_origin = [
                ['M',  0, 0 ],
                ['l',  2, 2 ],
                ['l',  2, 0 ],
                ['l',  0, 2 ],
                ['l',  8, 0 ],
                ['l',  0, -2],
                ['l',  2, 0 ],
                ['l',  2, -2],
                ['l', -2, 2 ],
                ['l', -2, 0 ],
                ['l', 0,  -2],
                ['l', -8, 0 ],
                ['l', 0,  2 ],
                ['l', -2, 0 ],
                ['m', 2, 0],
                ['l', 8, 0],
                ['Z']
            ];
        } else {
            this.path_origin = [
                ['M',  0, 0 ],
                ['l',  2, 2 ],
                ['l',  2, 0 ],
                ['l',  0, 2 ],
                ['l',  8, 0 ],
                ['l',  0, -2],
                ['l',  2, 0 ],
                ['l',  2, -2],
                ['l', -2, 2 ],
                ['l', -2, 0 ],
                ['l', 0,  -2],
                ['l', -8, 0 ],
                ['l', 0,  2 ],
                ['l', -2, 0 ],
                ['m', 2, 0],
                ['l', 2, 0],
                ['l', 2, 2],
                ['m', 0, -2],
                ['l', 4, 0],
                ['Z']
            ];
        }
    }

    /**
     * TODO: Дублирование кода! Алгоритм полностью аналогичен Resistor.draw()
     *
     * @param dot_inp
     * @param dot_out
     * @returns {null}
     */
    draw(dot_inp, dot_out) {
        if (dot_inp.y === dot_out.y) {
            /// Если вход и выход элемента расположены вдоль оси X
            this.orientation    = ORIENT.HORZ;

            this.size           = Math.abs(dot_out.x - dot_inp.x);

            this.bias.x         = Math.min(dot_inp.x, dot_out.x) + GRID_DOT_SIZE/2;
            this.bias.y         = dot_inp.y + GRID_DOT_SIZE/2;

        } else if (dot_inp.x === dot_out.x) {
            /// Если вход и выход элемента расположены вдоль оси Y
            this.orientation    = ORIENT.VERT;
            this.size           = Math.abs(dot_out.y - dot_inp.y);

            this.bias.x         = dot_inp.x - GRID_DOT_SIZE/2;
            this.bias.y         = Math.min(dot_inp.y, dot_out.y) + GRID_DOT_SIZE;
        } else {
            /// Если вход и выход элемента расположены неправильно
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

export default Button;