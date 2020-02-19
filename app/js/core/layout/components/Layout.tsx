import * as React from "react";
import Pane from "./Pane";
import ILayoutPane from "../interfaces/ILayoutPane";
import LayoutConfiguration from "../interfaces/LayoutConfiguration";

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

    renderPane(index: number, data: ILayoutPane) {
        return (
            <Pane key={index} panes={data.panes} orientation={data.orientation} />
        );
    }

    render() {
        console.log(JSON.stringify(this.props));

        const panes = this.props.config.modes[this.state.mode_name].panes.map(
            (pane, index) => this.renderPane(index, pane)
        );

        return (
            <div className="t_layout-container">
                {panes}
            </div>
        );
    }
}