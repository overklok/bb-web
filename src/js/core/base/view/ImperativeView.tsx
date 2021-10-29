import * as React from "react";
import {AllProps, IViewState, MountEvent, View} from "./View";
import {sleep} from "../../helpers/functions";

/**
 * React Component based {@link View} which relies on imperative modules
 * 
 * Adapts the {@link View} to be more friendly for third-patry components,
 * usually implemented in imperative style.
 */
export abstract class ImperativeView<P, S=IViewState> extends View<P, S> {
    /** @inheritdoc */
    public static notifyNestMount: boolean = true;

    /** @inheritdoc */
    protected constructor(props: AllProps<P>) {
        super(props);
    }

    /**
     * Generates DOM tree to the given container
     * 
     * Note: the content outside the container should not be modified
     * 
     * @param container container in which the tree will be injected
     */
    protected abstract inject(container: HTMLElement): void;

    /**
     * Destroys DOM tree from the given container
     * 
     * Note: the content outside the container should not be modified
     * 
     * @param container HTML node containing the tree injected by {@link inject} 
     */
    protected abstract eject(container: HTMLElement): void;

    /**
     * Translates prop updates to imperative-fiendly actions
     * 
     * If the parent {@link Nest} is just mounted, 
     * calls the injection method of the View as the DOM parent is created.
     * 
     * If the language is changed, calls the update method of the View, so
     * inherited Views can handle it manually (re-render/inject or make library function calls). 
     * 
     * @inheritdoc
     */
    public async componentDidUpdate(prevProps: Readonly<AllProps<P>>, prevState: Readonly<IViewState>, snapshot?: any) {
        if (prevProps.nest_mounted === false && this.props.nest_mounted === true) {
            // Wait until the nest is deployed because sometimes the content is not
            // centered correctly when required
            await new Promise(resolve => { requestAnimationFrame(resolve); });

            // first injection (i.e. nest just rendered)
            this.inject(this.props.ref_parent.current);

            this.mounted = true;
            this.viewDidMount();
            this.emit(new MountEvent());
        } else {
            // update if language is changed
            if (prevProps.lang !== this.props.lang) {
                this.update();
            }
        }
    }

    /**
     * XXX: Handling this has probably no effect
     */
    public async componentDidMount() {
        // if (this.props.nest_mounted === true) {
            // await this.injectAsync();

            // re-injection (i.e. nest already exists)
            // this.mounted = true;
            // this.viewDidMount();
            // this.emit(new MountEvent());
        // }
    }

    /**
     * Destroys DOM tree created by inject method
     */
    public componentWillUnmount() {
        if (this.props.nest_mounted === true) {
            this.eject(this.props.ref_parent.current);
        }

        super.componentWillUnmount();
    }

    /**
     * Updates injected content in line with new props
     */
    public update(): void { }

    /**
     * Renders empty content directly into the root of the View 
     * 
     * @returns 
     */
    public render(): React.ReactNode {
        super.render();

        return (
            <React.Fragment />
        )
    }

    /**
     * @deprecated
     */
    private async injectAsync() {
        await new Promise<void>((resolve) => {
            // Give some time for the browser to display layout switch animation
            // before injecting the tree (which is probably too heavy)
            setTimeout(() => {
                this.inject(this.props.ref_parent.current);
                resolve();
            }, 300)
        });
    }
}
