import * as React from "react";
import classNames from "classnames";
import {useDrop} from "react-dnd";
import {DraggableItemTypes} from "../LayoutView";


/**
 * @category Core.UI
 */
interface FrameProps {
    children: JSX.Element|JSX.Element[],
    covered: boolean,
}

/**
 * @category Core.UI
 * 
 * @component
 */
export default function Frame(props: FrameProps) {
    const [{is_over}, drop] = useDrop({
        accept: DraggableItemTypes.Tab,
        drop: () => {},
        collect: monitor => ({
            is_over: !!monitor.isOver(),
        }),
    });

    const klasses = classNames({
        'frame': true,
        'frame_covered': props.covered,
    })

    return (
        <div className={klasses} ref={drop}>
            {props.children}
        </div>
    )
}