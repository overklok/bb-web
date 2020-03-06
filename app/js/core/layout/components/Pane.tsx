import * as React from "react";
import {RefObject} from "react";
import classNames from "classnames";
import Handler from "./Handler";
import {ILayoutPane} from "../../configuration/LayoutConfiguration";
import {PaneOrientation} from "../types";

interface IProps {
    name: string,
    is_root: boolean,
    panes?: ILayoutPane[],
    orientation: PaneOrientation,

    size_unit: string,

    // начальный размер: PX / %
    size: string|number
    // минимальный размер: PX / %
    size_min: number
    // максимальный размер: PX / %
    size_max: number
}

interface IState {
    size: number,
    locked: boolean
}

// TODO:
// === PoC Completed ===
// 1. Refactor configuration
// 2. Add `fixed` shorthand for size_max and size_min
// 3. Add `resizable` option
// 4. Add resizing limits (px/%)
// 5. Refactor Pane
// 6. Animation
// 7. Transition

export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [] as ILayoutPane[],
        name: 'unnamed',
        is_root: false,
        orientation: PaneOrientation.Horizontal,

        size: 0,
        size_unit: '%',

        size_min: 0,
        size_max: 0,
    };

    private panes: RefObject<Pane>[] = [];
    private div_element: HTMLDivElement;

    constructor(props: IProps) {
        super(props);

        this.handleDragFinish = this.handleDragFinish.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
    }

    componentDidMount() {
        if (this.props.size_min) {
            if (this.is_vertical) {
                this.div_element.style.minHeight = this.props.size_min + 'px';
            } else {
                this.div_element.style.minWidth = this.props.size_min + 'px';
            }
        }

        if (this.props.size_max) {
            if (this.is_vertical) {
                this.div_element.style.maxHeight = this.props.size_max + 'px';
            } else {
                this.div_element.style.maxWidth = this.props.size_max + 'px';
            }
        }

        if (this.props.size == 0) return;

        if (this.is_vertical) {
            this.div_element.style.height = this.props.size + this.props.size_unit;
        } else {
            this.div_element.style.width = this.props.size + this.props.size_unit;
        }

        this.div_element.style.flexGrow = "0";
    }

    recalcChild() {
        let sizes = this.panes.map(
            // Подсчёт размеров без учёта border
            ref => this.is_vertical ?
                ref.current.div_element.clientWidth :
                ref.current.div_element.clientHeight
        );

        let overall_size = sizes.reduce((a, b) => a + b, 0);

        sizes = sizes.map(normalize(0, overall_size));

        for (const [i, ref] of this.panes.entries()) {
            const pane = ref.current;

            if (this.is_vertical) {
                pane.div_element.style.width = sizes[i] * 100 + '%';
            } else {
                pane.div_element.style.height = sizes[i] * 100 + '%';
            }
        }
    }

    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane, ref: RefObject<Pane>) {
        return (
            <Pane
                key={index}
                name={data.name}
                size={data.size}
                size_min={data.size_min}
                size_max={data.size_max}
                size_unit={data.size_unit}
                panes={data.panes}
                orientation={orientation}
                ref={ref}
            />
        );
    }

    renderHandler(index: number, orientation: PaneOrientation, pane_prev: number, pane_next: number) {
        return (
            <Handler key={`h${index}`} orientation={orientation} pane_prev_num={pane_prev} pane_next_num={pane_next}
                     handleDragStart={this.handleDragStart}
                     handleDragFinish={this.handleDragFinish}
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
        this.panes = [];

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
            <div className={klass} ref={div_element => {this.div_element = div_element}}>
                {elements}
            </div>
        );
    }

    test() {
        console.log(test);
    }

    handleDragging(movement_px: number, pane_prev_num: number, pane_next_num: number) {
        const pane_prev = this.panes[pane_prev_num].current;
        const pane_next = this.panes[pane_next_num].current;

        const div_prev = pane_prev.div_element;
        const div_next = pane_next.div_element;

        const size_prev_old_perc = Number((this.is_vertical ? div_prev.style.width : div_prev.style.height).slice(0, -1)),
              size_next_old_perc = Number((this.is_vertical ? div_next.style.width : div_next.style.height).slice(0, -1));

        const size_prev_old_px = this.is_vertical ? div_prev.clientWidth : div_prev.clientHeight,
              size_next_old_px = this.is_vertical ? div_next.clientWidth : div_next.clientHeight;

        let overdrag = null;

        // percents per pixel
        const ppp = (size_next_old_perc + size_prev_old_perc) / (size_prev_old_px + size_next_old_px);

        let movement_perc = movement_px * ppp;

        if (size_next_old_px - movement_px <= pane_next.props.size_min) {
            movement_perc = size_next_old_perc - pane_next.props.size_min * ppp;
            overdrag = 1;
        }

        if (size_prev_old_px + movement_px <= pane_prev.props.size_min) {
            movement_perc = -(size_prev_old_perc - pane_prev.props.size_min * ppp);
            overdrag = -1;
        }

        if (pane_next.props.size_max && size_next_old_px - movement_px >= pane_next.props.size_max) {
            movement_perc = (size_next_old_perc - pane_next.props.size_max * ppp);
            overdrag = -1;
        }

        if (pane_prev.props.size_max && size_prev_old_px + movement_px >= pane_prev.props.size_max) {
            movement_perc = -(size_prev_old_perc - pane_prev.props.size_max * ppp);
            overdrag = 1;
        }

        // Новый предполагаемый размер панели
        let size_prev_new = size_prev_old_perc + movement_perc,
            size_next_new = size_next_old_perc - movement_perc;

        if (this.is_vertical) {
            div_prev.style.width = size_prev_new + '%';
            div_next.style.width = size_next_new + '%';
        } else {
            div_prev.style.height = size_prev_new + '%';
            div_next.style.height = size_next_new + '%';
        }

        return overdrag;
    }

    handleDragStart(pane_num_prev: number, pane_num_next: number) {
        const pane_prev = this.panes[pane_num_prev].current;
        const pane_next = this.panes[pane_num_next].current;

        this.recalcChild();
    }

    handleDragFinish(pane_num_prev: number, pane_num_next: number) {
        const pane_prev = this.panes[pane_num_prev].current;
        const pane_next = this.panes[pane_num_next].current;

        this.recalcChild();
    }

    get is_vertical() {
        return this.props.orientation === PaneOrientation.Vertical;
    }

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}

function normalize(min: number, max: number) {
    const delta = max - min;
    return function (val: number) {
        return (val - min) / delta;
    };
}