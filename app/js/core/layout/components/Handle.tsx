import * as React from "react";
import classNames from "classnames";
import {PaneOrientation} from "../types";
import {logDeprecation} from "sweetalert/typings/modules/options/deprecations";

/**
 * Свойства рукоятки
 */
interface IProps {
    // ориентация
    orientation: PaneOrientation,
    // номер панели слева от рукоятки
    pane_prev_num: number,
    // номер панели справа от рукоятки
    pane_next_num: number,
    // обработчик события "захват рукоятки"
    handleDragStart:    Function,
    // обработчик события "освобождение рукоятки"
    handleDragFinish:   Function,
    // обработчик события "перемещение рукоятки"
    handleDragging:     Function,
}

/**
 * Состояние рукоятки
 */
interface IState {

}

/**
 * React-компонент "Рукоятка"
 *
 * Рукоятка позволяет изменять размер панелей, которые её окружают, путём
 * перемещения её в стороны.
 */
export default class Handle extends React.Component<IProps, IState> {
    // выполняется ли перемещение в данный момент
    private moving: boolean = false;
    // является ли знак овердрага положительным
    private overdrag_sign_pos: boolean = null;
    // основной html-элемент, который генерирует этот компонент
    private div_element: HTMLDivElement;
    private startposX: number;
    private startposY: number;

    constructor(props: IProps) {
        super(props);

        this.handleMouseUp      = this.handleMouseUp.bind(this);
        this.handleMouseDown    = this.handleMouseDown.bind(this);
        this.handleMouseMove    = this.handleMouseMove.bind(this);

        // prevent page scrolling on touch devices
        document.body.addEventListener(
            'touchmove',
            (e: any) => {e.preventDefault()},
            { passive: false }
        );
    }

    componentDidMount(): void {
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);

        document.addEventListener('touchend', this.handleMouseUp);
        document.addEventListener('touchmove', this.handleMouseMove);
    }

    componentWillUnmount(): void {
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);

        document.removeEventListener('touchend', this.handleMouseUp);
        document.removeEventListener('touchmove', this.handleMouseMove);
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
                 onTouchStart={this.handleMouseDown}
                 ref={div_element => {this.div_element = div_element}}
            />
        );
    }

    handleMouseDown(evt: any) {
        evt.preventDefault();

        this.startposX = evt.type === 'touchstart' ? evt.touches[0].pageX : evt.pageX;
        this.startposY = evt.type === 'touchstart' ? evt.touches[0].pageY : evt.pageY;

        this.moving = true;

        this.props.handleDragStart(this.props.pane_prev_num, this.props.pane_next_num);
    }

    handleMouseUp(evt: any) {
        if (this.moving === true) {
            evt.preventDefault();

            this.props.handleDragFinish(this.props.pane_prev_num, this.props.pane_next_num);
        }

        this.overdrag_sign_pos = null;
        this.moving = false;
    }

    handleMouseMove(evt: any) {
        if (this.moving === false) return;

        evt.preventDefault();

        const   pageX = evt.type === 'touchmove' ? evt.touches[0].pageX : evt.pageX,
                pageY = evt.type === 'touchmove' ? evt.touches[0].pageY : evt.pageY;

        const movementX = pageX - this.startposX;
        const movementY = pageY - this.startposY;

        this.startposX = pageX;
        this.startposY = pageY;

        const hdr_rect = this.div_element.getBoundingClientRect();

        let movement = this.props.orientation == PaneOrientation.Horizontal ? movementX : movementY;
        let cur_position = this.props.orientation == PaneOrientation.Horizontal ? pageX : pageY;
        let hdr_position = this.props.orientation == PaneOrientation.Horizontal ? hdr_rect.left : hdr_rect.top;

        // Учесть зум десктопного браузера
        if (evt.type !== 'touchmove') {
            movement /= window.devicePixelRatio;
        }

        // Овердраг - состояние, в котором о движении курсора в данном положении не следует сообщать.
        // По умолчанию сообщать о перетаскивании ручки
        let allowed = true;

        if (this.overdrag_sign_pos !== null) {

            // Не сообщать о перетаскивании ручки, если ранее был зафиксирован овердраг
            allowed = false;

            /* Если курсор возвращён обратно за позицию овердрага, можно считать, что овердрага больше нет.
             * Для того, чтобы выйти из овердрага, курсор нужно вернуть НАЗАД
             * (т.е. переместить его в обратном направлении ЗА позицию овердрага)
             */
            if (this.overdrag_sign_pos && cur_position <= hdr_position) {
                allowed = true;
            }

            if (!this.overdrag_sign_pos && cur_position >= hdr_position) {
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
            } else {
                this.overdrag_sign_pos = null;
            }
        }
    }
}