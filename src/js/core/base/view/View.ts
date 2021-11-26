import * as React from "react";
import {ReactNode} from "react";

import ViewConnector from "../ViewConnector";
import {ViewEvent} from "../Event";
import {Widget} from "../../services/interfaces/IViewService";

/**
 * Basic props required for a {@link View}
 * 
 * @category Core
 * @subcategory View
 */
export interface IViewBasicProps {
    connector: ViewConnector;
    ref_parent?: React.RefObject<HTMLElement>;
    widgets?: {[key: string]: Widget<any>};
    lang?: string;
}

/**
 * Total props of a {@link View}
 */
export type AllProps<P> = P & IViewBasicProps;

/**
 * Helper type that infers nested {@link IViewProps} based on {@link View} that uses it
 */
export type ViewPropsOf<V extends View<any, any>> = V extends View<infer P, any> ? P : never;

/**
 * Basic app-defined {@link View} props
 * 
 * @category Core
 * @subcategory View
 */
export interface IViewProps { }

/**
 * Basic app-defined {@link View} state
 * 
 * @category Core
 * @subcategory View
 */
export interface IViewState { }

export class RenderEvent extends ViewEvent<RenderEvent>     {}
export class MountEvent extends ViewEvent<MountEvent>       {}
export class UnmountEvent extends ViewEvent<UnmountEvent>   {}

/**
 * Defers the call of the decorated {@link View} method until it's mounted
 * 
 * Used as a decorator for {@link View} methods
 * 
 * @param target        prototype of the class
 * @param propertyKey   name of the method
 * @param descriptor    the Property Descriptor for the method
 */
export function deferUntilMounted(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }

    let original_method = descriptor.value;

    //editing the descriptor/value parameter
    const deferred = function () {
        const args = arguments;

        if (this.mounted) {
            return original_method.bind(this)(...arguments);
        }

        if (this.deferred_mount == null) {
            this.deferred_mount = [];
        }

        this.deferred_mount.push(function(): void {
            original_method.bind(this)(...args);
        });
    }

    descriptor.value = deferred;
}

/**
 * A passive interface that displays data (the {@link Model}) and routes user commands ({@link ViewEvent}) 
 * to the {@link Presenter} to act upon that data.
 * 
 * Views implementation is currently relied on React Components but it depends on the specific {@link ViewService}.
 * 
 * @category Core
 * @subcategory View
 */
export abstract class View<P extends IViewProps = IViewProps, S extends IViewState = IViewState> extends React.Component<AllProps<P>, S> {
    /** string identifier that can be referred when asking the ViewService to list all Views that currently exist */
    public static alias: string;

    /** whether the View is mounted */
    protected mounted: boolean;

    /** functions to call when the View is mounted */
    private deferred_mount: Function[];

    /**
     * Creates the View
     * 
     * @param props initial React properties of the View
     */
    constructor(props: AllProps<P>) {
        super(props);

        this.mounted = false;
    }

    /**
     * Attaches itself to presenters aggregated by given {@link ViewConnector}.
     * 
     * @param connector connector for the {@link View}
     */
    public attachConnector(connector: ViewConnector) {
        if (connector !== this.props.connector) {
            connector.attach(this);
        }
    }

    /**
     * Detaches itself from presenters aggregated by given {@link ViewConnector}
     * 
     * Does not recommended due to the lack of React Component mount-unmount event ordering.
     * 
     * @deprecated
     */
    public detachConnector() {
        if (this.props.connector) {
            this.props.connector.detach();
        }
    }

    /**
     * Passes events expected by the View when mounted 
     */
    public componentDidMount() {
        this.mounted = true;
        this.viewDidMount();
        this.emit(new MountEvent({}));
    }

    /**
     * Passes events expected by the View when unmounted 
     */
    public componentWillUnmount() {
        this.mounted = false;
        this.emit(new UnmountEvent({}));
        this.viewWillUnmount();
    }

    /**
     * Renders content of the View
     * 
     * @returns child JSX components of the View
     */
    public render(): ReactNode {
        this.emit(new RenderEvent({}));

        return null;
    }

    /**
     * Handles window resize
     * 
     * It may be helpful to optimize the contents when the window is resized,
     * so this method may be implemented for this purpose.
     */
    public resize() {}

    /**
     * Handles when the View is mounted
     */
    protected viewDidMount() {
        // console.log(this.constructor.name, 'mount');
        this.props.connector.attach(this);
        this.callDeferredUntilMount();
    }

    /**
     * Handles when the View is unmounted
     */
    protected viewWillUnmount() {
        this.detachConnector();
        // console.log(this.constructor.name, 'unmount');
    }

    /**
     * Sends an event to the attached connector
     * 
     * @param event instance of event required to send
     * 
     * @returns release when an event is handled
     */
    protected emit<E>(event: ViewEvent<E>): Promise<void> {
        return this.props.connector.emit(event);
    }

    /**
     * Performs all deferred method calls
     */
    private callDeferredUntilMount() {
        if (!this.deferred_mount) return;

        let call = undefined;

        while (call = this.deferred_mount.pop()) {
            call.bind(this)();
        }
    }
}