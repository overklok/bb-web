import * as React from "react";
import {AllProps, IViewProps, MountEvent, UnmountEvent, View} from "./View";
import classNames from "classnames";
import ViewConnector from "../ViewConnector";
import {ViewType} from "../../helpers/types";
import {Widget} from "../../services/interfaces/IViewService";
import ErrorBoundary from "./ErrorBoundary";
import {CSSProperties} from "react";


interface INestProps<P=IViewProps> {
    connector: ViewConnector;

    widgets?: {[key: string]: Widget<any>};
    view_type: ViewType<P, any>;
    view_props: P;
    nest_style?: CSSProperties;
    label: string;
    index: number;
}

interface INestState {
    mounted: boolean;
}

export default class Nest extends React.Component<INestProps<any>, INestState> {
    private readonly ref = React.createRef<HTMLDivElement>();
    private view: View;
    private view_props: AllProps<any>

    constructor(props: INestProps<any>) {
        super(props);

        this.state = {
            mounted: false,
        };

        this.onRefUpdated = this.onRefUpdated.bind(this);

        this.view_props = this.props.connector.collectProps();
        this.view_props = {...this.props.view_props, ...this.view_props};
    }

    componentDidMount() {
        if (Object.getPrototypeOf(this.view).constructor.notifyNestMount) {
            this.setState({mounted: true});
        }

        this.props.connector.onPropsUpdate((props: IViewProps) => {
            this.view_props = {...this.view_props, ...props};
            this.render();
        });
    }

    componentDidUpdate(prevProps: Readonly<INestProps>, prevState: Readonly<INestState>, snapshot?: any) {
        // if (this.view) {
        //     this.view.attachConnector(this.props.connector);
        // }
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

        console.log('nest', SpecificView, this.view_props);

        return (
            <div className={klasses} ref={this.ref} style={this.props.nest_style}>
                <ErrorBoundary view_type={this.props.view_type}>
                    <SpecificView
                        {...this.view_props}
                        ref={this.onRefUpdated}
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