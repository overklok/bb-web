import * as React from "react";
import classNames from "classnames";
import {useDrag} from "react-dnd";
import TabMenu from "./TabMenu";
import {DraggableItemTypes} from "../../../../views/LayoutView";

/**
 * Props for {@link Tab}
 * 
 * @category Core
 * @subcategory View
 */
interface TabProps {
    /** caption of the tab */
    label: string;
    /** index of the tab */
    index: number;
    /** is the tab is single in the list */
    is_single?: boolean;
    /** number of active tab in the list */
    active_tab: number;
    /** tab click handler */
    on_click?: Function;
    /** a node where the content of the context menu will be rendered via portal */
    overlay_node?: HTMLElement;
}

/**
 * UI component representing a single tab item for {@link TabViewComposer} 
 */
const Tab = React.forwardRef((props: TabProps, ref_menu: React.RefObject<TabMenu>) => {
    const onClick = () => {
        const { index, on_click } = props;

        if (!props.is_single && props.on_click) {
            on_click(index);
        }
    };

    const {is_single, active_tab, index, label, overlay_node} = props;

    const [{is_dragging}, drag] = useDrag({
        item: {type: DraggableItemTypes.Tab},
        collect: monitor => ({
            is_dragging: !!monitor.isDragging()
        })
    });

    // Список классов, которые должны использоваться в зависимости от свойств
    let klasses = classNames({
        'tab': true,
        'tab_active': active_tab == index,
        'tab_single': is_single
    });

    return (
        <li className={klasses} onClick={onClick} ref={drag}>
            <span className='tab__title'>{label}</span>
            <TabMenu ref={ref_menu} overlay_node={overlay_node} />
        </li>
    )
});

export default Tab;