import * as React from "react";
import {IViewProps, IViewState, View} from "./View";

export abstract class ImperativeView<O> extends View<O, IViewState> {
    public static notifyNestMount: boolean = true;

    protected constructor(props: IViewProps<O>) {
        super(props);
    }

    protected abstract inject(container: HTMLElement): void;
    protected abstract eject(container: HTMLElement): void;

    public componentDidUpdate(prevProps: Readonly<IViewProps<O>>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.nest_mounted === false && this.props.nest_mounted === true) {
            this.inject(this.props.ref_parent.current);
        }
    }

    public componentDidMount() {
        super.componentDidMount();

        if (this.props.nest_mounted === true) {
            this.inject(this.props.ref_parent.current);
        }
    }

    public componentWillUnmount() {
        if (this.props.nest_mounted === true) {
            this.eject(this.props.ref_parent.current);
        }

        super.componentWillUnmount();
    }

    public render(): React.ReactNode {
        super.render();

        return (
            <React.Fragment />
        )
    }
}
