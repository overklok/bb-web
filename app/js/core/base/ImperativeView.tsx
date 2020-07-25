import * as React from "react";
import {IViewProps, IViewState, View} from "./View";

export interface IImperativeViewProps extends IViewProps {
    mounted: boolean;
}

export abstract class ImperativeView<P extends IImperativeViewProps> extends View<P, IViewState> {
    protected constructor(props: P) {
        super(props);
    }

    abstract inject(container: HTMLDivElement): void;

    abstract eject(container: HTMLDivElement): void;

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.mounted === false && this.props.mounted === true) {
            this.inject(this.props.ref_nest.current);
        }
    }

    componentDidMount() {
        if (this.props.mounted === true) {
            this.inject(this.props.ref_nest.current);
        }
    }

    componentWillUnmount() {
        if (this.props.mounted === true) {
            this.eject(this.props.ref_nest.current);
        }
    }

    render(): React.ReactNode {
        super.render();

        return (
            <React.Fragment />
        )
    }
}
