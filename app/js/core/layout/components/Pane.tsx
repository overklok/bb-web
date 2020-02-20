import * as React from "react";
import classNames from "classnames";
import {ILayoutPane, PaneOrientation} from "../types";

interface IProps {
    name: string,
    panes?: ILayoutPane[],
    orientation: PaneOrientation
}

interface IState {
    mode_name: string
}

export default class Pane extends React.Component<IProps, IState> {
    static defaultProps = {
        panes: [],
        name: 'unnamed',
        orientation: PaneOrientation.Horizontal
    };

    constructor(props: IProps) {
        super(props);

        this.state = {
            mode_name: 'default'
        }
    }

    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane) {
        return (
            <Pane key={index} name={data.name} panes={data.panes} orientation={orientation} />
        );
    }

    render() {
        const orientation = Pane.inverseOrientation(this.props.orientation);

        let klass = classNames({
            'pane': true,
            'pane-h': this.props.orientation == PaneOrientation.Horizontal,
            'pane-v': this.props.orientation == PaneOrientation.Vertical,
        });

        const panes = this.props.panes.map(
            (pane, index) => this.renderPane(index, orientation, pane)
        );

        return (
            <div className={klass}>
                {panes}
            </div>
        );
    }

    static inverseOrientation(orientation: PaneOrientation) {
        return orientation === PaneOrientation.Horizontal ? PaneOrientation.Vertical : PaneOrientation.Horizontal;
    }
}