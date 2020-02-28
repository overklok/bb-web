import * as React from "react";
import classNames from "classnames";
import {ILayoutPane, PaneOrientation} from "../types";
import Pane from "./Pane";

interface IProps {
    orientation: PaneOrientation,
    pane_prev_num: number,
    pane_next_num: number,
    handleDragStart:    Function,
    handleDragFinish:   Function,
    handleDragging:     Function,
}

interface IState {

}

export default class Handler extends React.Component<IProps, IState> {
    private moving: boolean = false;
    private overdrag_sign_pos:  boolean = false;
    private div_element: HTMLDivElement;

    constructor(props: IProps) {
        super(props);

        this.handleMouseUp      = this.handleMouseUp.bind(this);
        this.handleMouseDown    = this.handleMouseDown.bind(this);
        this.handleMouseMove    = this.handleMouseMove.bind(this);
    }

    componentDidMount(): void {
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount(): void {
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    render() {
        let klass = classNames({
            'handler': true,
            'handler-h': this.props.orientation == PaneOrientation.Horizontal,
            'handler-v': this.props.orientation == PaneOrientation.Vertical,
        });

        return (
            <div className={klass}
                 onMouseDown={this.handleMouseDown}
                 ref={div_element => {this.div_element = div_element}}
            />
        );
    }

    handleMouseDown() {
        this.moving = true;

        this.props.handleDragStart(this.props.pane_prev_num, this.props.pane_next_num);
    }

    handleMouseUp() {
        if (this.moving === true) {
            this.props.handleDragFinish(this.props.pane_prev_num, this.props.pane_next_num);
        }

        this.moving = false;
    }

    handleMouseMove(evt: MouseEvent) {
        if (this.moving === false) return;

        let movement = this.props.orientation == PaneOrientation.Horizontal ? evt.movementX : evt.movementY;
        let cur_position = this.props.orientation == PaneOrientation.Horizontal ? evt.pageX : evt.pageY;
        let hdr_position = this.props.orientation == PaneOrientation.Horizontal ? this.div_element.offsetLeft : this.div_element.offsetTop;

        // Овердраг - состояние, в котором о движении курсора в данном положении не следует сообщать.
        // По умолчанию сообщать о перетаскивании ручки
        let allowed = true;

        if (this.overdrag_sign_pos !== null) {
            // Не сообщать о перетаскивании ручки, если ранее был зафиксирован овердраг
            allowed = false;

            // console.log("pos", cur_position, hdr_position, this.overdrag_sign_pos);

            /* Если курсор возвращён обратно за позицию овердрага, можно считать, что овердрага больше нет.
             * Для того, чтобы выйти из овердрага, курсор нужно вернуть НАЗАД
             * (т.е. переместить его в обратном направлении ЗА позицию овердрага)
             */
            if (this.overdrag_sign_pos && cur_position <= hdr_position) {
                // console.log(movement)

                // console.log("unlock", this.overdrag_sign_pos, movement);
                // console.groupEnd();

                allowed = true;
            }

            if (!this.overdrag_sign_pos && cur_position >= hdr_position) {
                // console.log(movement)

                // console.log("unlock", this.overdrag_sign_pos, movement);
                // console.groupEnd();

                allowed = true;
            }
        }

        if (allowed) {
            /* Определить, привело ли движение к овердрагу, может только обработчик перетаскивания ручки.
             * Само перетаскивание ручки фиктивно, т.к. осуществляется за счёт изменения размера окружающих её панелей.
             * Если при перетаскивании какая-либо из панелей запрещает дальнейшее изменение размеров, движение ручки должно
             * быть заблокировано. Для этого ручка включает режим овердрага.
             * При этом фиксируется, на сколько пискелей движение превышает максимально допустимое.
             * Это значение и возвращается следующей функцией.
             */
            const overdrag_sign_pos = this.props.handleDragging(movement, this.props.pane_prev_num, this.props.pane_next_num);

            /* Если было зафиксировано избыточное движение курсора, нужно запомнить положение овердрага.
             * Оно определяется по положению курсора, зарегистрированному в предыдущий раз.
             * Также фиксируется направление овердрага,
             * т.к. для его последующего снятия нужно учитывать знак при сравнении позиций.
             */
            if (overdrag_sign_pos !== null) {
                this.overdrag_sign_pos = overdrag_sign_pos > 0;
                // console.group("od");
                // console.log("lock", cur_position, movement, overdrag_sign_pos);
            } else {
                this.overdrag_sign_pos = null;
            }
        }
    }
}