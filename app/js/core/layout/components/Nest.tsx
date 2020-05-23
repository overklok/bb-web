import * as React from "react";
import {View} from "../../ui/View";
import classNames from "classnames";
import {PaneOrientation} from "../types";


interface IProps {
    view_type: typeof View
}

interface IState {
}

export default class Nest extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
        }
    }

    render() {
        const SpecificView = this.props.view_type;

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses = classNames({
            'nest': true,
        });

        return (
            <div className={klasses}>
                <SpecificView />
            </div>
        )
    }
}