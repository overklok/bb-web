import * as React from "react";
import {RefObject} from "react";
import classNames from "classnames";
import {ILayoutPane, PaneOrientation} from "../types";
import Handler from "./Handler";

interface IProps {
    name: string,
    is_root: boolean,
    panes?: ILayoutPane[],
    orientation: PaneOrientation,

    size_min: number
}

interface IState {
    size: number,
    locked: boolean
}

export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [] as ILayoutPane[],
        name: 'unnamed',
        is_root: false,
        orientation: PaneOrientation.Horizontal,

        size_min: 0
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
        // this.recalcChild(true);
    }

    recalcSize() {
        if (this.props.is_root) return;

        if (this.props.orientation === PaneOrientation.Horizontal) {
            this.div_element.style.width = this.div_element.clientWidth + 'px';
        } else {
            this.div_element.style.height = this.div_element.clientHeight + 'px';
        }
    }

    recalcChild(allow_grow: boolean = false) {
        let sizes = [];

        for (const ref of this.panes) {
            const pane = ref.current;

            if (this.is_vertical) {
                sizes.push(pane.div_element.offsetWidth);
            } else {
                sizes.push(pane.div_element.offsetHeight);
            }
        }

        let overall_size = sizes.reduce((a, b) => a + b, 0);

        sizes = sizes.map(normalize(0, overall_size));

        for (const [i, ref] of this.panes.entries()) {
            const pane = ref.current;

            if (this.is_vertical) {
                pane.div_element.style.width = sizes[i] * 100 + '%';
            } else {
                pane.div_element.style.height = sizes[i] * 100 + '%';
            }

            // Разблокировать изменения
            pane.div_element.style.flexGrow = "1";
        }
    }

    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane, ref: RefObject<Pane>) {
        return (
            <Pane key={index} name={data.name} panes={data.panes} orientation={orientation} ref={ref} />
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

    handleDragging(movement: number, pane_prev_num: number, pane_next_num: number) {
        const pane_prev = this.panes[pane_prev_num].current;
        const pane_next = this.panes[pane_next_num].current;

        const div_prev = pane_prev.div_element;
        const div_next = pane_next.div_element;

        const ss_prev = div_prev.style;
        const ss_next = div_next.style;

        const size_prev_old = this.is_vertical ? Number(ss_prev.width.slice(0, -1)) : Number(ss_prev.height.slice(0, -1)),
              size_next_old = this.is_vertical ? Number(ss_next.width.slice(0, -1)) : Number(ss_next.height.slice(0, -1));

        const size_prev_old_px = this.is_vertical ? div_prev.clientWidth : div_prev.clientHeight,
              size_next_old_px = this.is_vertical ? div_next.clientWidth : div_next.clientHeight;

        let overdrag = null;

        // percents per pixel
        const ppp = (size_next_old + size_prev_old) / (size_prev_old_px + size_next_old_px);

        movement *= ppp;

        // TODO: Use percent as the main measure unit

        if (size_next_old - movement < pane_next.props.size_min) {
            movement = size_next_old - pane_next.props.size_min;
            overdrag = 1;
        }

        if (size_prev_old + movement < pane_prev.props.size_min) {
            movement = -(size_prev_old - pane_prev.props.size_min);
            overdrag = -1;
        }

        // Новый предполагаемый размер панели
        let size_prev_new = size_prev_old + movement,
            size_next_new = size_next_old - movement;

        if (this.is_vertical) {
            ss_prev.width = size_prev_new + '%';
            ss_next.width = size_next_new + '%';
        } else {
            ss_prev.height = size_prev_new + '%';
            ss_next.height = size_next_new + '%';
        }

        return overdrag;
    }

    handleDragStart(pane_num_prev: number, pane_num_next: number) {
        const pane_prev = this.panes[pane_num_prev].current;
        const pane_next = this.panes[pane_num_next].current;

        this.recalcChild(false);
    }

    handleDragFinish(pane_num_prev: number, pane_num_next: number) {
        const pane_prev = this.panes[pane_num_prev].current;
        const pane_next = this.panes[pane_num_next].current;

        this.recalcChild(true);
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