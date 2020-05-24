import * as React from "react";
import classNames from "classnames";
import {useDrag} from "react-dnd";
import {DraggableItemTypes} from "../../types";

interface IProps {
    label: string,
    index: number,
    is_single?: boolean,
    active_tab: number,
    on_click?: Function,
}

export default function Tab(props: IProps) {
    const onClick = () => {
        const { index, on_click } = props;

        if (!props.is_single && props.on_click) {
            on_click(index);
        }
    };

    const {is_single, active_tab, index, label} = props;

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
            <span>{label}</span>
        </li>
    )
}