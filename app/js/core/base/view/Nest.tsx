import * as React from "react";
import {IViewOptions, View} from "./View";
import classNames from "classnames";
import ViewConnector from "../ViewConnector";
import {ViewType} from "../../helpers/types";
import {Widget} from "../../services/interfaces/IViewService";
import ErrorBoundary from "./ErrorBoundary";


interface IProps<O extends IViewOptions> {
    connector: ViewConnector;

    widgets?: {[key: string]: Widget<any>};
    view_type: ViewType<O, any>;
    view_options?: O;
    label: string;
    index: number;
}

interface IState {
    mounted: boolean;
}

export default class Nest extends React.Component<IProps<any>, IState> {
    private readonly ref = React.createRef<HTMLDivElement>();
    private readonly ref_view = React.createRef<View<any, any>>();

    constructor(props: IProps<any>) {
        super(props);

        this.state = {
            mounted: false,
        };
    }

    componentDidMount() {
        if (Object.getPrototypeOf(this.ref_view.current).constructor.notifyNestMount) {
            this.setState({mounted: true});
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps<any>>, prevState: Readonly<IState>, snapshot?: any) {
        if (this.ref_view.current) {
            this.ref_view.current.attachConnector(this.props.connector);
        }
    }

    notifyResizeView() {
        this.props.connector.resizeView();
    }

    render() {
        const SpecificView = this.props.view_type;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'nest': true,
        });

        // if (this.ref_view.current) {
        //     this.ref_view.current.attachConnector(this.props.connector);
        // }

        const vopts = this.props.view_options;
        let overflow = vopts ? vopts.overflow : null;
        overflow = overflow || 'auto';

        return (
            <div className={klasses} ref={this.ref} style={{overflow}}>
                <ErrorBoundary view_type={this.props.view_type}>
                    <SpecificView
                        ref={this.ref_view}
                        widgets={this.props.widgets}
                        connector={this.props.connector}
                        ref_parent={this.ref}
                        options={this.props.view_options}
                        nest_mounted={this.state.mounted}
                    />
                </ErrorBoundary>
            </div>
        )
    }
}