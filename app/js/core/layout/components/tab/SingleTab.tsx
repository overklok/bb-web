import * as React from "react";
import classNames from "classnames";
import Tab from "./Tab";
import TabMenu from "./TabMenu";

interface IProps {
    label: string,
}

const SingleTab = React.forwardRef((props: IProps, ref_menu: React.RefObject<TabMenu>) => {
    return (
        <Tab
            active_tab={0}
            index={0}
            label={props.label}
            is_single={true}
            ref={ref_menu}
        />
    )
});

export default SingleTab;