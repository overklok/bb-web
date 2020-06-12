import * as React from "react";
import ViewConnector from "../helpers/containers/ViewConnector";

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
}