import * as React from "react";
import ViewConnector from "../helpers/containers/ViewConnector";
import {ViewEvent} from "./Event";

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

    emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }
}