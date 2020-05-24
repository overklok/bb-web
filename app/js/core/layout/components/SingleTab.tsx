import * as React from "react";
import classNames from "classnames";
import {ILayoutPane} from "../../configuration/LayoutConfiguration";
import Tab from "./Tab";

interface IProps {
    label: string,
}

export default class SingleTab extends React.Component<IProps, null> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <Tab
                active_tab={0}
                index={0}
                label={this.props.label}
                is_single={true}
            />
        )
    }
}