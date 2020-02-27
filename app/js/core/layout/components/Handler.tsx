import * as React from "react";
import classNames from "classnames";
import {ILayoutPane, PaneOrientation} from "../types";
import Pane from "./Pane";

interface IProps {
    orientation: PaneOrientation,
    pane_prev: number,
    pane_next: number,
    handleDragStart:    Function,
    handleDragFinish:   Function,
    handleDragging:     Function,
}

interface IState {

}

export default class Handler extends React.Component<IProps, IState> {
    private moving: boolean = false;
    private overdrag_position:     number = 0;
    private overdrag_sign_pos:  boolean = false;

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
            />
        );
    }

    handleMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.moving = true;

        this.props.handleDragStart(this.props.pane_prev, this.props.pane_next);
    }

    handleMouseUp() {
        if (this.moving === true) {
            this.props.handleDragFinish(this.props.pane_prev, this.props.pane_next);
        }

        this.moving = false;
    }

    handleMouseMove(evt: MouseEvent) {
        if (this.moving === false) return;

        let movement = this.props.orientation == PaneOrientation.Horizontal ? evt.movementX : evt.movementY;
        let position = this.props.orientation == PaneOrientation.Horizontal ? evt.pageX : evt.pageY;

        // Овердраг - состояние, в котором о движении курсора в данном положении не следует сообщать.
        // По умолчанию сообщать о перетаскивании ручки
        let allowed = true;

        if (this.overdrag_position !== 0) {
            // Не сообщать о перетаскивании ручки, если ранее был зафиксирован овердраг
            allowed = false;

            /* Если курсор возвращён обратно за позицию овердрага, можно считать, что овердрага больше нет.
             * Для того, чтобы выйти из овердрага, курсор нужно вернуть НАЗАД
             * (т.е. переместить его в обратном направлении ЗА позицию овердрага)
             */
            if ((this.overdrag_sign_pos && position > this.overdrag_position) ||
                (!this.overdrag_sign_pos && position <= this.overdrag_position)
            ) allowed = true;
        }

        if (allowed) {
            /* Определить, привело ли движение к овердрагу, может только обработчик перетаскивания ручки.
             * Само перетаскивание ручки фиктивно, т.к. осуществляется за счёт изменения размера окружающих её панелей.
             * Если при перетаскивании какая-либо из панелей запрещает дальнейшее изменение размеров, движение ручки должно
             * быть заблокировано. Для этого ручка включает режим овердрага.
             * При этом фиксируется, на сколько пискелей движение превышает максимально допустимое.
             * Это значение и возвращается следующей функцией.
             */
            const overdrag_movement = this.props.handleDragging(movement, this.props.pane_prev, this.props.pane_next);

            /* Если было зафиксировано избыточное движение курсора, нужно запомнить положение овердрага.
             * Оно определяется по положению курсора, зарегистрированному в предыдущий раз.
             * Также фиксируется направление овердрага,
             * т.к. для его последующего снятия нужно учитывать знак при сравнении позиций.
             */
            if (overdrag_movement !== 0) {
                this.overdrag_position = position - movement;
                this.overdrag_sign_pos = overdrag_movement > 0;
            } else {
                this.overdrag_position = 0;
            }
        }
    }
}