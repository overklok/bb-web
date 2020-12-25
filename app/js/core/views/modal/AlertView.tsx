import * as React from "react";
import {Overlay} from "./Modal";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import {CSSTransition} from "react-transition-group";

export interface IAlert {
    content?: string;
}

interface AlertViewProps extends IViewState {
    alerts: IAlert[];
}

export default class AlertView extends View<AlertViewProps, null> {
    static defaultProps: AlertViewProps = {
        alerts: []
    }

    constructor(props: AllProps<AlertViewProps>) {
        super(props);
    }

    render(): React.ReactNode {
        return this.props.alerts.map((alert, i) => (
            <div key={i}>{alert.content}</div>
        ));
    }
}