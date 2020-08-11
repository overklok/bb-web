import * as React from "react";
import {IViewProps, IViewState, View} from "./View";

export abstract class ImperativeView<P extends IViewProps> extends View<P, IViewState> {
    protected constructor(props: P) {
        super(props);
    }

    protected abstract inject(container: HTMLElement): void;
    protected abstract eject(container: HTMLElement): void;

    public componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.mounted === false && this.props.mounted === true) {
            this.inject(this.props.ref_parent.current);
        }
    }

    public componentDidMount() {
        super.componentDidMount();

        if (this.props.mounted === true) {
            this.inject(this.props.ref_parent.current);
        }
    }

    public componentWillUnmount() {
        if (this.props.mounted === true) {
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
