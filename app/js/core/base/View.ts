import * as React from "react";
import ViewConnector from "../helpers/containers/ViewConnector";
import {AbstractEvent} from "./Event";

export interface IViewProps {
    connector: ViewConnector;
}

export interface IViewState {

}

export class View extends React.Component<IViewProps, IViewState> {
    constructor(props: IViewProps) {
        super(props);

        this.props.connector.activate(this);
    }

    emit(event: AbstractEvent) {
        this.props.connector.emit(event);
    }
}