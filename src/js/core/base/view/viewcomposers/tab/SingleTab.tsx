import * as React from "react";
import classNames from "classnames";
import Tab from "./Tab";
import TabMenu from "./TabMenu";

/**
 * @category Core
 * @subcategory View
 */
interface SingleTabProps {
    label: string;
    overlay_node?: HTMLElement;
}

/**
 * @category Core
 * @subcategory View
 * 
 * @component
 */
const SingleTab = React.forwardRef((props: SingleTabProps, ref_menu: React.RefObject<TabMenu>) => {
    return (
        <Tab
            active_tab={0}
            index={0}
            label={props.label}
            is_single={true}
            overlay_node={props.overlay_node}
            ref={ref_menu}
        />
    )
});

export default SingleTab;