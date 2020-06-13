import * as React from "react";
import {View} from "../../base/View";
import classNames from "classnames";
import ViewService from "../../services/ViewService";
import ViewConnector from "../../helpers/containers/ViewConnector";


interface IProps {
    svc_view: ViewService;

    view_type: typeof View;
    label: string;
    index: number;
}

interface IState {
}

export default class Nest extends React.Component<IProps, IState> {
    private readonly connector: ViewConnector;
    constructor(props: IProps) {
        super(props);

        this.connector = this.props.svc_view.getViewConnector(this.props.view_type);
    }

    render() {
        const SpecificView = this.props.view_type;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'nest': true,
        });

        return (
            <div className={klasses}>
                <SpecificView
                    connector={this.connector}
                />
            </div>
        )
    }
}