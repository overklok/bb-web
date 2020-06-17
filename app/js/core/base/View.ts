import * as React from "react";
import ViewConnector from "../helpers/ViewConnector";
import {AbstractEvent, ViewEvent} from "./Event";
import {ReactNode} from "react";

export interface IViewProps {
    connector: ViewConnector;
}

export interface IViewState {

}

export class RenderEvent extends AbstractEvent<RenderEvent> {
    public readonly posX: number;
    public readonly posY: number;
}

export class MountEvent extends AbstractEvent<MountEvent> {
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

    render(): ReactNode {
        this.emit(new RenderEvent({
           posX: 0,
           posY: 0
        }));

        return null;
    }
}