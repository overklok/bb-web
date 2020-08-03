import * as React from "react";
import classNames from "classnames";
import {useDrag} from "react-dnd";
import TabMenu from "./TabMenu";
import {DraggableItemTypes} from "../../../views/layout/LayoutView";

interface IProps {
    label: string;
    index: number;
    is_single?: boolean;
    active_tab: number;
    on_click?: Function;
    overlay_node?: HTMLElement;
}

const Tab = React.forwardRef((props: IProps, ref_menu: React.RefObject<TabMenu>) => {
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