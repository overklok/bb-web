import * as React from "react";
import ViewConnector from "./ViewConnector";
import {AbstractEvent, ViewEvent} from "../Event";
import {ReactNode} from "react";
import {Widget} from "../../services/interfaces/IViewService";
import {coverOptions} from "../../helpers/functions";

export interface IViewOptions {

}

export interface IViewProps<O extends IViewOptions> {
    nest_mounted: boolean;
    connector: ViewConnector;
    ref_parent?: React.RefObject<HTMLElement>;
    widgets?: {[key: string]: Widget<any>};
    options?: O;
}

export interface IViewState {

}

export class RenderEvent extends ViewEvent<RenderEvent>     {}
export class MountEvent extends ViewEvent<MountEvent>       {}
export class UnmountEvent extends ViewEvent<UnmountEvent>   {}
export class ResizeEvent extends ViewEvent<ResizeEvent>     {}

export abstract class View<O extends IViewOptions, S extends IViewState> extends React.Component<IViewProps<O>, S> {
    public static defaultOptions: IViewOptions;
    public static notifyNestMount: boolean = false;

    protected options: Readonly<O>;
    protected mounted: boolean;

    constructor(props: IViewProps<O>) {
        super(props);

        this.mounted = false;

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
        this.mounted = true;
        this.viewDidMount();
        this.emit(new MountEvent({}));
    }

    public componentWillUnmount() {
        this.mounted = false;
        this.emit(new UnmountEvent({}));
        this.viewWillUnmount();
    }

    public render(): ReactNode {
        this.emit(new RenderEvent({}));

        return null;
    }

    public resize() {}

    protected viewDidMount() {
        console.log(this.constructor.name, 'mount');
    }

    protected viewWillUnmount() {
        console.log(this.constructor.name, 'unmount');

        this.props.connector.detach();
    }

    protected emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }
}