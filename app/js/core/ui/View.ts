import * as React from "react";
import ViewConnector from "./ViewConnector";
import {AbstractEvent, ViewEvent} from "./Event";
import {ReactNode} from "react";

export interface IViewProps {
    connector: ViewConnector;
    ref_nest: React.RefObject<HTMLDivElement>;
    on_viewinfo_ready?: Function;
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

        this.props.connector.activate(this);
    }

    emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }

    componentDidMount() {
        this.emit(new MountEvent({}));
    }

    resize() {}

    render(): ReactNode {
        this.emit(new RenderEvent({}));

        return null;
    }
}