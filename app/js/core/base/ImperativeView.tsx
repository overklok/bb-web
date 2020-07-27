import * as React from "react";
import {IViewProps, IViewState, View} from "./View";

export interface IImperativeViewProps extends IViewProps {
    mounted: boolean;
}

export abstract class ImperativeView<P extends IImperativeViewProps> extends View<P, IViewState> {
    protected constructor(props: P) {
        super(props);
    }

    protected abstract inject(container: HTMLDivElement): void;
    protected abstract eject(container: HTMLDivElement): void;

    public componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.mounted === false && this.props.mounted === true) {
            this.inject(this.props.ref_nest.current);
        }
    }

    public componentDidMount() {
        super.componentDidMount();

        if (this.props.mounted === true) {
            this.inject(this.props.ref_nest.current);
        }
    }

    public componentWillUnmount() {
        if (this.props.mounted === true) {
            this.eject(this.props.ref_nest.current);
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
