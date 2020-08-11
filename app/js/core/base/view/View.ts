import * as React from "react";
import ViewConnector from "./ViewConnector";
import {AbstractEvent, ViewEvent} from "../Event";
import {ReactNode} from "react";
import {Widget} from "../../services/interfaces/IViewService";

export interface IViewOptions {

}

export interface IViewProps<O extends IViewOptions> {
    mounted: boolean;
    connector: ViewConnector;
    ref_parent?: React.RefObject<HTMLElement>;
    on_viewinfo_ready?: Function;
    widgets?: {[key: string]: Widget};
    options?: O;
}

export interface IViewState {

}

export class RenderEvent extends AbstractEvent<RenderEvent> {
}

export class MountEvent extends AbstractEvent<MountEvent> {
}

export class ResizeEvent extends AbstractEvent<ResizeEvent> {
}

export abstract class View<O extends IViewOptions, S extends IViewState> extends React.Component<IViewProps<O>, S> {
    public static defaultOptions: IViewOptions;
    protected options: O;

    protected constructor(props: IViewProps<O>) {
        super(props);

        const defaults = Object.getPrototypeOf(this).constructor.defaultOptions;
        this.options = this.coverOptions(this.props.options, defaults) as O;

        this.props.connector.attach(this);
    }

    public attachConnector(connector: ViewConnector) {
        if (connector !== this.props.connector) {
            connector.attach(this);
        }
    }

    public componentDidMount() {
        this.viewDidMount();
        this.emit(new MountEvent({}));
    }

    public componentWillUnmount() {
        this.viewWillUnmount();
    }

    public render(): ReactNode {
        this.emit(new RenderEvent({}));

        return null;
    }

    public resize() {}

    protected viewDidMount() {}
    protected viewWillUnmount() {}

    protected emit<E>(event: ViewEvent<E>) {
        this.props.connector.emit(event);
    }

    private coverOptions(options: {[key: string]: any}, defaults: {[key: string]: any}) {
        const result: {[key: string]: any} = {};

        /// Если не заданы опции - выдать опции по умолчанию
        if (typeof options === "undefined") return defaults as O;

        /// Если options - не объект, то возвратить значение
        if (typeof options !== 'object') return options;

        /// Для каждой заданной опции выполнить рекурсивно поиск опции
        for (const option_key of Object.keys(defaults)) {
            result[option_key] = this.coverOptions(options[option_key], defaults[option_key]);
        }

        return result;
    }
}