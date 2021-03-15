import * as React from "react";
import ViewConnector from "../ViewConnector";
import {AbstractEvent, ViewEvent} from "../Event";
import {ReactNode} from "react";
import {Widget} from "../../services/interfaces/IViewService";
import {coverObjects} from "../../helpers/functions";
import {ModalAction, ModalRequestCallback} from "./Nest";

// export interface IViewOptions {
//     overflow?: string;
// }

export interface IViewBasicProps {
    nest_mounted: boolean;
    connector: ViewConnector;
    ref_parent?: React.RefObject<HTMLElement>;
    widgets?: {[key: string]: Widget<any>};
    action_request?: ModalRequestCallback;
}

export type AllProps<P> = P & IViewBasicProps;

/**
 * Helper type that infers nested IViewProps based on View that uses it
 */
export type ViewPropsOf<V extends View<any, any>> = V extends View<infer P, any> ? P : never;

export interface IViewProps {

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

export abstract class View<P extends IViewProps = IViewProps, S extends IViewState = IViewState> extends React.Component<AllProps<P>, S> {
    public static alias: string;
    public static notifyNestMount: boolean = false;

    protected mounted: boolean;

    private deferrees_mount: Function[];

    constructor(props: AllProps<P>) {
        super(props);

        this.mounted = false;
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

    public requestModalAction(action: ModalAction) {
        console.trace('rma', action);
        this.props.action_request && this.props.action_request(action);
    }

    protected viewDidMount() {
        // console.log(this.constructor.name, 'mount');
        this.props.connector.attach(this);
        this.callDeferredUntilMount();
    }

    protected viewWillUnmount() {
        this.detachConnector();
        // console.log(this.constructor.name, 'unmount');
    }

    protected emit<E>(event: ViewEvent<E>) {
        return this.props.connector.emit(event);
    }

    private callDeferredUntilMount() {
        if (!this.deferrees_mount) return;

        let call = undefined;

        while (call = this.deferrees_mount.pop()) {
            call.bind(this)();
        }
    }
}