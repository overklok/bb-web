import * as React from "react";
import {IViewProps, IViewState, View} from "./View";

export abstract class ImperativeView<P extends IViewProps> extends View<P, IViewState> {
    private readonly ref = React.createRef<HTMLDivElement>()

    protected constructor(props: P) {
        super(props);
    }

    abstract inject(container: HTMLDivElement): void;

    abstract eject(container: HTMLDivElement): void;

    componentDidMount() {
        this.inject(this.props.ref_nest.current);
    }

    componentWillUnmount() {
        this.eject(this.props.ref_nest.current);
    }

    render(): React.ReactNode {
        super.render();

        return (
            <React.Fragment />
        )
    }
}
