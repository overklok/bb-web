import * as React from "react";

import {AllProps, IViewProps, View} from "./View";
import ViewConnector from "../ViewConnector";
import {ViewType} from "../../helpers/types";
import {Widget} from "../../services/interfaces/IViewService";
import ErrorBoundary from "./ErrorBoundary";
import {CSSProperties} from "react";

/**
 * Props for {@link Nest}
 */
interface NestProps<P=IViewProps> {
    /** 
     * an object which communicates the {@link View} 
     * inside the {@link Nest} with other parts of the app 
     */
    connector: ViewConnector;

    /** current language of the {@link View} (defined recursively) */
    lang: string;
    /** children widgets for the {@link View} (to give the View ablilty to render inner Views) */
    widgets?: {[key: string]: Widget<any>};
    /** function (class) which instantiates {@link View} components */
    view_type: ViewType<P, any>;
    /** app-defined initial properties of the {@link View} */
    view_props: P;
    /** additional CSS proprerties for the {@link Nest} */
    nest_style?: CSSProperties;
}

/**
 * State of {@link Nest}
 */
interface NestState {
    /** whether the nest is mounted */
    mounted: boolean;
    /** props collected from {@link Presenter}s by {@link ViewConnector} */
    view_props: AllProps<any>;
}

/**
 * A component wrapping the {@link View} component to connect 
 * it with other parts of the application.
 * 
 * @category Core
 * @subcategory View
 * 
 * @component
 */
export default class Nest extends React.PureComponent<NestProps<any>, NestState> {
    /** ref for the node representing the nest */
    private readonly ref = React.createRef<HTMLDivElement>();
    /** View component instance mounted inside the Nest */
    private view: View;

    /**
     * Initializes Nest instance with default state
     * 
     * @param props 
     */
    constructor(props: NestProps<any>) {
        super(props);

        this.onRefUpdated = this.onRefUpdated.bind(this);

        this.state = {
            mounted: false,
            view_props: this.props.connector.collectProps()
        };
    }

    /**
     * Attaches a handler to pass props updates to the View
     * 
     * @inheritdoc
     */
    componentDidMount() {
        this.props.connector.onPropsUpdate((props: IViewProps) => {
            this.setState({
                view_props: {...this.state.view_props, ...props}
            })
        });
    }

    /**
     * Handles when the Nest is unmounted
     * 
     * Detaches a handler passing props updates to the View
     * 
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.connector.onPropsUpdate(null);
    }

    /**
     * Handles when the Nest is updated
     * 
     * Attaches ViewConnector instance to the View to control it
     * from related Presenters.
     * 
     * @inheritdoc
     */
    componentDidUpdate(prevProps: Readonly<NestProps>, prevState: Readonly<NestState>, snapshot?: any) {
        if (this.view) {
            this.view.attachConnector(this.props.connector);
        }
    }

    /**
     * Propagates to call {@link View.resize} function to handle window resize
     */
    notifyResizeView() {
        this.props.connector.resizeView();
    }

    /**
     * Handle View instance updates 
     * 
     * @param view 
     */
    onRefUpdated(view: View) {
        // view created
        if (view && !this.view) {
            this.view = view;
        }

        // view updated
        if (view && this.view && view !== this.view) {
            this.view = view;
        }

        // view destroyed
        if (!view && this.view) {
            this.view = view;
        }
    }

    render() {
        // Keep the class in the constant to refer to it in JSX part above
        const SpecificView = this.props.view_type;

        // Merge the props of the View collected by the ViewConnector (in the state) 
        // with initial values of the View
        const props = {...this.props.view_props, ...this.state.view_props};

        return (
            <div className='nest' ref={this.ref} style={this.props.nest_style}>
                <ErrorBoundary view_type={this.props.view_type}>
                    <SpecificView
                        {...props}
                        ref={this.onRefUpdated}
                        lang={this.props.lang}
                        widgets={this.props.widgets}
                        connector={this.props.connector}
                        ref_parent={this.ref}
                    />
                </ErrorBoundary>
            </div>
        )
    }
}