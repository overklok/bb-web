import * as React from "react";
import ViewConnector from "./ViewConnector";
import {AbstractEvent, ViewEvent} from "../Event";
import {ReactNode} from "react";
import {Widget} from "../../services/interfaces/IViewService";
import {coverOptions} from "../../helpers/functions";

export interface IViewOptions {

}

export interface IViewProps<O extends IViewOptions> {
    mounted: boolean;
    connector: ViewConnector;
    ref_parent?: React.RefObject<HTMLElement>;
    on_viewinfo_ready?: Function;
    widgets?: {[key: string]: Widget<any>};
    options?: O;
}

export interface IViewState {

}

export abstract class View<O extends IViewOptions, S extends IViewState> extends React.Component<IViewProps<O>, S> {
    public static defaultOptions: IViewOptions;
    protected options: O;

    constructor(props: IViewProps<O>) {
        super(props);

        const defaults = Object.getPrototypeOf(this).constructor.defaultOptions;
        this.options = coverOptions(this.props.options, defaults) as O;

        this.props.connector.attach(this);
    }

    public setOptions<K extends keyof O>(
        options: ((prevState: Readonly<O>) => (Pick<O, K> | O | null)) | (Pick<O, K> | O | null)
    ) {
        this.options = coverOptions(options, this.props.options) as O;
    }

    public attachConnector(connector: ViewConnector) {
        if (connector !== this.props.connector) {
            connector.attach(this);
        }
    }

    public componentDidMount() {
        this.viewDidMount();
    }

    public componentWillUnmount() {
        this.viewWillUnmount();
    }

    public render(): ReactNode {
        return null;
    }

    public resize() {}

    protected viewDidMount() {}
    protected viewWillUnmount() {}

    protected emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }
}