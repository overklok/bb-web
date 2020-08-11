import * as React from "react";
import ViewConnector from "./ViewConnector";
import {AbstractEvent, ViewEvent} from "../Event";
import {ReactNode} from "react";
import {Widget} from "../../services/interfaces/IViewService";

export interface IViewOptions {

}

export interface IViewProps<O extends IViewOptions> {
    mounted: boolean;
    connector: ViewConnector;
    ref_parent?: React.RefObject<HTMLElement>;
    on_viewinfo_ready?: Function;
    widgets?: {[key: string]: Widget};
    options?: O;
}

export interface IViewState {

}

export class RenderEvent extends AbstractEvent<RenderEvent> {
}

export class MountEvent extends AbstractEvent<MountEvent> {
}

export class ResizeEvent extends AbstractEvent<ResizeEvent> {
}

export abstract class View<O extends IViewOptions, S extends IViewState> extends React.Component<IViewProps<O>, S> {
    protected constructor(props: IViewProps<O>) {
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