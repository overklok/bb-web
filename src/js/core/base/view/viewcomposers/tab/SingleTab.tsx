import * as React from "react";
import classNames from "classnames";
import Tab from "./Tab";
import TabMenu from "./TabMenu";

/**
 * Props for {@link SingleTab}
 * 
 * @category Core
 * @subcategory View
 */
interface SingleTabProps {
    /** caption of the tab */
    label: string;
    /** a node where the content of the context menu will be rendered via portal */
    overlay_node?: HTMLElement;
}

/**
 * Helper component representing single tab
 * 
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