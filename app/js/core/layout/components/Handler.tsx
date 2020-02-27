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
                 onMouseDown = {this.handleMouseDown}
            />
        );
    }

    handleMouseDown() {
        this.moving = true;

        this.props.handleDragFinish(this.props.pane_prev, this.props.pane_next);
    }

    handleMouseUp() {
        if (this.moving === true) {
            this.props.handleDragStart(this.props.pane_prev, this.props.pane_next);
        }

        this.moving = false;
    }

    handleMouseMove(evt: Event) {
        if (this.moving === true) {
            this.props.handleDragging(evt, this.props.pane_prev, this.props.pane_next);
        }
    }

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}