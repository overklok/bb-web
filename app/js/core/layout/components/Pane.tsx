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
    private divElement: HTMLDivElement;

    constructor(props: IProps) {
        super(props);

        this.handleDragFinish = this.handleDragFinish.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
    }

    componentDidMount() {
        // this.recalcSize();
    }

    recalcSize(allow_grow: boolean = false) {
        if (this.props.is_root) return;

        // this.divElement.style.width = null;
        // this.divElement.style.height = null;
        //
        // this.divElement.style.flexGrow = "1";

        if (this.props.orientation === PaneOrientation.Horizontal) {
            this.divElement.style.width = this.divElement.offsetWidth + 'px';
        } else {
            this.divElement.style.height = this.divElement.offsetHeight + 'px';
        }

        // Разблокировать изменения
        this.divElement.style.flexGrow = allow_grow ? "1" : "0";
    }

    recalcChild(allow_grow: boolean = false) {
        for (const ref of this.panes) {
            const pane = ref.current;
            pane.recalcSize(allow_grow);
        }
    }

    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane, ref: RefObject<Pane>) {
        return (
            <Pane key={index} name={data.name} panes={data.panes} orientation={orientation} ref={ref} />
        );
    }

    renderHandler(index: number, orientation: PaneOrientation, pane_prev: number, pane_next: number) {
        return (
            <Handler key={`h${index}`} orientation={orientation} pane_prev={pane_prev} pane_next={pane_next}
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
            <div className={klass} ref={divElement => {this.divElement = divElement}}>
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

        const ss_prev = pane_prev.divElement.style;
        const ss_next = pane_next.divElement.style;

        // TODO: Normalize sizes (keep ratio with same sum)
        // TODO: Докручивать до минимума при овердраге

        if (this.props.orientation === PaneOrientation.Vertical) {
            // Новый предполагаемый размер панели
            const size_new_prev = Number(ss_prev.width.slice(0, -2)) + movement;
            const size_new_next = Number(ss_next.width.slice(0, -2)) - movement;

            // Разница между новым и предельно мнимальным размерами панели
            const diff_min_prev = size_new_prev - pane_prev.props.size_min;
            const diff_min_next = size_new_next - pane_next.props.size_min;

            if (diff_min_prev >= 0 && diff_min_next >= 0) {
                // Положительная разница означает, что есть куда уменьшать панель
                ss_prev.width = size_new_prev + 'px';
                ss_next.width = size_new_next + 'px';
            } else {
                // Отрицательная разница означает, что движение мыши слишком велико для изменения размера
                // Эту разницу возвращаем ручке
                if (diff_min_prev < 0) return -diff_min_prev;
                if (diff_min_next < 0) return diff_min_next;
            }
        } else {
            // Новый предполагаемый размер панели
            const size_new_prev = Number(ss_prev.height.slice(0, -2)) + movement;
            const size_new_next = Number(ss_next.height.slice(0, -2)) - movement;

            // Разница между новым и предельно мнимальным размерами панели
            const diff_min_prev = size_new_prev - pane_prev.props.size_min;
            const diff_min_next = size_new_next - pane_next.props.size_min;

            if (diff_min_prev >= 0 && diff_min_next >= 0) {
                // Положительная разница означает, что есть куда уменьшать панель
                ss_prev.height = size_new_prev + 'px';
                ss_next.height = size_new_next + 'px';
            } else {
                // Отрицательная разница означает, что движение мыши слишком велико для изменения размера
                // Эту разницу возвращаем ручке
                if (diff_min_prev < 0) return -diff_min_prev;
                if (diff_min_next < 0) return diff_min_next;
            }
        }

        return 0;
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

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}