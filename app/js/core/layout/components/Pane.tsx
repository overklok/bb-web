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

// size_min может быть только в PX. % не имеют значения
// size_min не может быть больше size, если size задан в PX

// Правила задания размеров:
// 1. В любой момент времени все панели должны занимать 100% всей родительской панели.
// 2. По умолчанию размер панели можно изменять.
// 3. С помощью параметра (size) пользователь задаёт соотношение панели или её начальный размер:
//  3.1. Если size не задан, панель счиается свободной.
//  3.2. Если задаются соотношения (%):
//      3.2.1. Если все под-панели несвободны, сумма их размеров составлять ровно 100%
//      3.2.2. Если есть как минимум одна свободная под-панель, сумма размеров несвободных панелей не должна превышать 100%.
//  3.3. Если задаются начальные размеры (PX), то в панели должна быть как минимум одна свободная под-панель.
//  3.4. При наличии свободных под-панелей:
//      3.4.1. Устанавливается минимальный размер корневой панели, равный сумме минимальных размеров всех под-панелей.
// 4. С помощью параметра (size_min) пользователь задаёт минимальный размер панели (PX).
//  4.1. Для свободных панелей задание size_min невозможно.
//  4.2. Если size_min не задан, минимальный размер панели принимается равным нулю.
//  4.3. size_min не может быть больше size, если size задан в PX
// 5. С помощью параметра (size_max) пользователь задаёт максимальный размер панели (PX).
//  5.1. Для свободных панелей задание size_min невозможно.
//  5.2. Если size_max не задан, максимальный размер панели не ограничен.
//  5.3. size_max не может быть меньше size, если size задан в PX
//  5.4. size_max не может быть меньше size_min

export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [] as ILayoutPane[],
        name: 'unnamed',
        is_root: false,
        orientation: PaneOrientation.Horizontal,

        size: 0,

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

    componentDidMount() {}

    recalcChild() {
        let sizes = this.panes.map(
            // Подсчёт размеров без учёта border
            ref => this.is_vertical ?
                ref.current.div_element.clientWidth :
                ref.current.div_element.clientHeight
        );

        console.log('sizes-b', sizes);

        let overall_size = sizes.reduce((a, b) => a + b, 0);

        sizes = sizes.map(normalize(0, overall_size));

        console.log('sizes-a', sizes);

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

        // TODO: работа с пиксельными ограничениями

        // console.log(movement_px, ppp, movement_px * ppp);

        let movement_perc = movement_px * ppp;

        if (size_next_old_px - movement_px <= pane_next.props.size_min) {
            movement_perc = size_next_old_perc - pane_next.props.size_min;
            overdrag = 1;
        }

        if (size_prev_old_px + movement_px <= pane_prev.props.size_min) {
            movement_perc = -(size_prev_old_perc - pane_prev.props.size_min);
            overdrag = -1;
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