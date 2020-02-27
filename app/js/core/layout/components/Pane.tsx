import * as React from "react";
import classNames from "classnames";
import {ILayoutPane, PaneOrientation} from "../types";
import Handler from "./Handler";
import {Ref, RefObject} from "react";

interface IProps {
    name: string,
    is_root: boolean,
    panes?: ILayoutPane[],
    orientation: PaneOrientation
}

interface IState {
    mode_name: string
}

export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [] as ILayoutPane[],
        name: 'unnamed',
        is_root: false,
        orientation: PaneOrientation.Horizontal
    };

    private panes: RefObject<Pane>[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {mode_name: 'default'};

        this.handleDragFinish   = this.handleDragFinish.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
    }

    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane, ref: RefObject<Pane>) {
        return (
            <Pane key={index} name={data.name} panes={data.panes} orientation={orientation} ref={ref} />
        );
    }

    renderHandler(index: number, orientation: PaneOrientation, pane_prev: number, pane_next: number) {
        return (
            <Handler key={`h${index}`} orientation={orientation} pane_prev={pane_prev} pane_next={pane_next}
                     handleDragStart={this.handleDragFinish}
                     handleDragFinish={this.handleDragStart}
                     handleDragging={this.handleDragging}
            />
        )
    }

    render() {
        const orientation = Pane.inverseOrientation(this.props.orientation);

        let klass = classNames({
            'root': this.props.is_root,
            'pane': true,
            'pane-h': this.props.orientation == PaneOrientation.Horizontal,
            'pane-v': this.props.orientation == PaneOrientation.Vertical,
        });

        const elements = [];

        for (const [index, pane] of this.props.panes.entries()) {
            const ref: RefObject<Pane> = React.createRef();
            const pane_comp = this.renderPane(index, orientation, pane, ref);
            this.panes.push(ref);

            elements.push(pane_comp);

            if (index !== (this.props.panes.length - 1)) {
                elements.push(this.renderHandler(index, orientation, index, index+1));
            }
        }

        return (
            <div className={klass}>
                {elements}
            </div>
        );
    }

    test() {
        console.log(test);
    }

    handleDragging(evt: Event, pane_prev: number, pane_next: number) {
        console.log('mmv', evt, pane_prev, pane_next);
    }

    handleDragStart(pane_prev: number, pane_next: number) {
        console.log('mdn', pane_prev, pane_next);



        // For the pair of panes being resized:
            // If BOTH of the panes weren't locked previously (all has the flex-grow: 1):
                // Recalculate the sizes of all of the panes
                // Mark PREVIOUS or NEXT of the panes as UNLOCKED
            // If ONE of the panes weren't locked previously:
                // OK, mark it as UNLOCKED, it will be used later while dragging
            // If NONE of the panes weren't locked previously (all has the flex-grow: 0):
                // Impossible case

        // Set flex-grow: 0 for ALL panes except UNLOCKED one; its size will not be modified after locking
    }

    handleDragFinish(pane_prev: number, pane_next: number) {
        console.log('mup', pane_prev, pane_next);
        console.log(this.panes[pane_prev].current, this.panes[pane_next].current);

        // For the pair of panes being resized:
            // If one of the panes is locked to change, restrict movements
            // Also validate its min-size and max-size

            // Change size of locked pane of the pair
    }

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}