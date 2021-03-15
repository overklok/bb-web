import * as React from "react";
import {AllProps, IViewProps, MountEvent, UnmountEvent, View} from "./View";
import classNames from "classnames";
import ViewConnector from "../ViewConnector";
import {ViewType} from "../../helpers/types";
import {Widget} from "../../services/interfaces/IViewService";
import ErrorBoundary from "./ErrorBoundary";
import {CSSProperties} from "react";

export enum TerminalAction {
    None,
    Close,
    Accept,
    Dismiss
}

interface INestProps<P=IViewProps> {
    connector: ViewConnector;

    widgets?: {[key: string]: Widget<any>};
    view_type: ViewType<P, any>;
    view_props: P;
    nest_style?: CSSProperties;

    // Request to close parent modal (available as ModalView child only)
    terminal_request?: (action: TerminalAction) => void;
    terminal_reject?: (action: TerminalAction) => void;
    terminal_action?: TerminalAction;

    label: string;
    index: number;
}

interface INestState {
    mounted: boolean;
    view_props: AllProps<any>;
}

export default class Nest extends React.PureComponent<INestProps<any>, INestState> {
    private readonly ref = React.createRef<HTMLDivElement>();
    private view: View;

    constructor(props: INestProps<any>) {
        super(props);

        this.onRefUpdated = this.onRefUpdated.bind(this);

        this.state = {
            mounted: false,
            view_props: this.props.connector.collectProps()
        };
    }

    shouldComponentUpdate(
        nextProps: Readonly<INestProps<any>>,
        nextState: Readonly<INestState>,
        nextContext: any
    ): boolean {
        // Check if non-empty action has been requested
        if (nextProps.terminal_action && this.props.terminal_action === TerminalAction.None) {
            // Reject modal close if view exists and gives false response
            if (this.view && !this.view.shouldModalTerminate()) {
                this.props.terminal_reject && this.props.terminal_reject(nextProps.terminal_action);
            } else {
                this.props.terminal_request && this.props.terminal_request(nextProps.terminal_action);
            }
        }

        // If terminal action is changed only, prevent re-rendering by hiding the change from the props
        if (nextProps.terminal_action !== this.props.terminal_action) {
            const props = {...nextProps, terminal_action: this.props.terminal_action};

            return super.shouldComponentUpdate(props, nextState, nextContext);
        }

        return super.shouldComponentUpdate(nextProps, nextState, nextContext);
    }

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

    componentWillUnmount() {
        this.props.connector.onPropsUpdate(null);
    }

    componentDidUpdate(prevProps: Readonly<INestProps>, prevState: Readonly<INestState>, snapshot?: any) {
        if (this.view) {
            this.view.attachConnector(this.props.connector);
        }
    }

    notifyResizeView() {
        this.props.connector.resizeView();
    }

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

        // Список классов, которые должны использоваться в зависимости от свойств
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
                        widgets={this.props.widgets}
                        connector={this.props.connector}
                        ref_parent={this.ref}
                        nest_mounted={this.state.mounted}
                        close_request={this.props.terminal_request}
                    />
                </ErrorBoundary>
            </div>
        )
    }
}