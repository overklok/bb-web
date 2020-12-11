import * as React from "react";
import {AllProps, IViewProps, IViewState, MountEvent, View} from "./View";
import {sleep} from "../../helpers/functions";

export abstract class ImperativeView<P, S=IViewState> extends View<P, S> {
    public static notifyNestMount: boolean = true;

    protected constructor(props: AllProps<P>) {
        super(props);
    }

    protected abstract inject(container: HTMLElement): void;
    protected abstract eject(container: HTMLElement): void;

    public async componentDidUpdate(prevProps: Readonly<AllProps<P>>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.nest_mounted === false && this.props.nest_mounted === true) {
            await sleep(0);

            // first injection (i.e. nest just rendered)
            await this.injectAsync();

            this.mounted = true;
            this.viewDidMount();
            this.emit(new MountEvent());

        }
    }

    public async componentDidMount() {
        if (this.props.nest_mounted === true) {
            await this.injectAsync();

            // re-injection (i.e. nest already exists)
            this.mounted = true;
            this.viewDidMount();
            this.emit(new MountEvent());

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

    private async injectAsync() {
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                this.inject(this.props.ref_parent.current);
                resolve();
            }, 0)
        });
    }
}
