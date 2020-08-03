import * as React from "react";
import ViewConnector from "./ViewConnector";
import {AbstractEvent, ViewEvent} from "../Event";
import {ReactNode} from "react";
import {Widget} from "../../services/interfaces/IViewService";

export interface IViewProps {
    connector: ViewConnector;
    ref_nest?: React.RefObject<HTMLDivElement>;
    on_viewinfo_ready?: Function;
    widgets?: {[key: string]: Widget};
}

export interface IViewState {

}

export class RenderEvent extends AbstractEvent<RenderEvent> {
}

export class MountEvent extends AbstractEvent<MountEvent> {
}

export class ResizeEvent extends AbstractEvent<ResizeEvent> {
}

export abstract class View<P extends IViewProps, S extends IViewState> extends React.Component<P, S> {
    protected constructor(props: P) {
        super(props);

        this.props.connector.attach(this);
    }

    public attachConnector(connector: ViewConnector) {
        if (connector !== this.props.connector) {
            connector.attach(this);
        }
    }

    public componentDidMount() {
        this.viewDidMount();
        this.emit(new MountEvent({}));
    }

    public componentWillUnmount() {
        this.viewWillUnmount();
    }

    public render(): ReactNode {
        this.emit(new RenderEvent({}));

        return null;
    }

    public resize() {}

    protected viewDidMount() {}
    protected viewWillUnmount() {}

    protected emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }
}