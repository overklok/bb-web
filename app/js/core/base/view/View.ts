import * as React from "react";
import ViewConnector from "../ViewConnector";
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

export function deferUntilMounted(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }

    let original_method = descriptor.value;

    //editing the descriptor/value parameter
    const deferree = function () {
        const args = arguments;

        if (this.mounted) {
            return original_method.bind(this)(...arguments);
        }

        if (this.deferrees_mount == null) {
            this.deferrees_mount = [];
        }

        this.deferrees_mount.push(function(): void {
            original_method.bind(this)(...args);
        });
    }

    descriptor.value = deferree;
}

export abstract class View<O extends IViewOptions, S extends IViewState> extends React.Component<IViewProps<O>, S> {
    public static defaultOptions: IViewOptions;
    public static notifyNestMount: boolean = false;

    protected options: Readonly<O>;
    protected mounted: boolean;

    private deferrees_mount: Function[];

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

    public detachConnector() {
        if (this.props.connector) {
            this.props.connector.detach();
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
        this.callDeferredUntilMount();
    }

    protected viewWillUnmount() {
        console.log(this.constructor.name, 'unmount');

        this.detachConnector();
    }

    protected emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }

    private callDeferredUntilMount() {
        if (!this.deferrees_mount) return;

        let call = undefined;

        while (call = this.deferrees_mount.pop()) {
            call.bind(this)();
        }
    }
}