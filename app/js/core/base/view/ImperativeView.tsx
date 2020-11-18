import * as React from "react";
import {IViewProps, IViewState, MountEvent, View} from "./View";
import {sleep} from "../../helpers/functions";

export abstract class ImperativeView<O> extends View<O, IViewState> {
    public static notifyNestMount: boolean = true;

    protected constructor(props: IViewProps<O>) {
        super(props);
    }

    protected abstract inject(container: HTMLElement): void;
    protected abstract eject(container: HTMLElement): void;

    public async componentDidUpdate(prevProps: Readonly<IViewProps<O>>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.nest_mounted === false && this.props.nest_mounted === true) {
            await sleep(0);

            // first injection (i.e. nest just rendered)
            await this.injectAsync();

            this.mounted = true;
            this.viewDidMount();
            this.emit(new MountEvent({}));
        }
    }

    public async componentDidMount() {
        if (this.props.nest_mounted === true) {
            await this.injectAsync();

            // re-injection (i.e. nest already exists)
            this.mounted = true;
            this.viewDidMount();
            this.emit(new MountEvent({}));
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
        await new Promise((resolve) => {
            setTimeout(() => {
                this.inject(this.props.ref_parent.current);
                resolve();
            }, 0)
        });
    }
}
