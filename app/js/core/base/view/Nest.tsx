import * as React from "react";
import {IViewProps, View} from "./View";
import classNames from "classnames";
import ViewConnector from "../ViewConnector";
import {ViewType} from "../../helpers/types";
import {Widget} from "../../services/interfaces/IViewService";
import ErrorBoundary from "./ErrorBoundary";


interface INestProps<P=IViewProps> {
    connector: ViewConnector;

    widgets?: {[key: string]: Widget<any>};
    view_type: ViewType<P, any>;
    view_props: P;
    label: string;
    index: number;
}

interface INestState {
    mounted: boolean;
}

export default class Nest extends React.Component<INestProps<any>, INestState> {
    private readonly ref = React.createRef<HTMLDivElement>();
    private readonly ref_view = React.createRef<View>();
    private view: View;

    constructor(props: INestProps<any>) {
        super(props);

        this.state = {
            mounted: false,
        };

        this.onRefUpdated = this.onRefUpdated.bind(this);
    }

    componentDidMount() {
        if (Object.getPrototypeOf(this.view).constructor.notifyNestMount) {
            this.setState({mounted: true});
        }
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
        this.view = view;
        this.props.connector.attach(view);
    }

    render() {
        const SpecificView = this.props.view_type;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'nest': true,
        });

        const view_props = this.props.connector.collectProps();

        return (
            <div className={klasses} ref={this.ref}>
                <ErrorBoundary view_type={this.props.view_type}>
                    <SpecificView
                        {...view_props}
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