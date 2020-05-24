import * as React from "react";
import classNames from "classnames";
import {ILayoutPane} from "../../../configuration/LayoutConfiguration";
import Tab from "./Tab";

interface IProps {
    label: string,
}

export default function SingleTab(props: IProps) {
    return (
        <Tab
            active_tab={0}
            index={0}
            label={props.label}
            is_single={true}
        />
    )
}