import * as React from "react";
import Pane from "./Pane";
import {ILayoutPane, LayoutConfiguration, PaneOrientation} from "../types";
import classNames from "classnames";

require('css/layout.less');

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

    render() {
        const orientation = this.props.config.modes[this.state.mode_name].policy;

        const panes = this.props.config.modes[this.state.mode_name].panes;

        return (
            <Pane is_root={true} panes={panes} name='root' orientation={orientation} />
        );
    }
}