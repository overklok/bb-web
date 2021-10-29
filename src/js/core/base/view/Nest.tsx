import * as React from "react";

import {AllProps, IViewProps, View} from "./View";
import classNames from "classnames";
import ViewConnector from "../ViewConnector";
import {ViewType} from "../../helpers/types";
import {Widget} from "../../services/interfaces/IViewService";
import ErrorBoundary from "./ErrorBoundary";
import {CSSProperties} from "react";

interface INestProps<P=IViewProps> {
    connector: ViewConnector;

    lang: string;
    widget_alias: string;
    widgets?: {[key: string]: Widget<any>};
    view_type: ViewType<P, any>;
    view_props: P;
    nest_style?: CSSProperties;

    label: string;
    index: number;
}

interface INestState {
    mounted: boolean;
    view_props: AllProps<any>;
}

/**
 * A component which wraps the View to manage its lifecycle
 */
export default class Nest extends React.PureComponent<INestProps<any>, INestState> {
    /** ref for the node representing the nest */
    private readonly ref = React.createRef<HTMLDivElement>();
    /** View component instance mounted inside the Nest */
    private view: View;

    /**
     * Initializes Nest instance with default state
     * 
     * @param props 
     */
    constructor(props: INestProps<any>) {
        super(props);

        this.onRefUpdated = this.onRefUpdated.bind(this);

        this.state = {
            mounted: false,
            view_props: this.props.connector.collectProps()
        };
    }

    /**
     * Handles when the Nest is mounted
     * 
     * For Views requiring to notify when the Nest is mounted, updates its `nest_mounted` prop.
     * Attaches a handler to pass props updates to the View.
     * 
     * @inheritdoc
     */
    componentDidMount() {
        if (Object.getPrototypeOf(this.view).constructor.notifyNestMount) {
            this.setState({mounted: true});
        }

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
    componentDidUpdate(prevProps: Readonly<INestProps>, prevState: Readonly<INestState>, snapshot?: any) {
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
        const SpecificView = this.props.view_type;

        let klasses = classNames({
            'nest': true,
        });

        const props = {...this.state.view_props, ...this.props.view_props};

        return (
            <div className={klasses} ref={this.ref} style={this.props.nest_style}>
                <ErrorBoundary view_type={this.props.view_type}>
                    <SpecificView
                        {...props}
                        ref={this.onRefUpdated}
                        lang={this.props.lang}
                        widgets={this.props.widgets}
                        connector={this.props.connector}
                        ref_parent={this.ref}
                        nest_mounted={this.state.mounted}
                    />
                </ErrorBoundary>
            </div>
        )
    }
}