import * as React from "react";
import Pane from "./Pane";
import {ILayoutPane, LayoutConfiguration, PaneOrientation} from "../types";

interface ILayoutProps {
    config: LayoutConfiguration,
}

interface ILayoutState {
    mode_name: string
}

export default class Layout extends React.Component<ILayoutProps, ILayoutState> {
    constructor(props: ILayoutProps) {
        super(props);

        this.state = {
            mode_name: 'default'
        }
    }

    renderPane(index: number, orientation: PaneOrientation, data: ILayoutPane) {
        return (
            <Pane key={index} panes={data.panes} orientation={data.orientation} />
        );
    }

    render() {
        const orientation = this.props.config.modes[this.state.mode_name].policy;

        const panes = this.props.config.modes[this.state.mode_name].panes.map(
            (pane, index) => this.renderPane(index, orientation, pane)
        );

        return (
            <div className="layout">
                {panes}
            </div>
        );
    }
}