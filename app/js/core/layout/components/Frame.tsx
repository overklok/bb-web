import * as React from "react";
import classNames from "classnames";
import {useDrop} from "react-dnd";
import {DraggableItemTypes} from "../types";

interface IProps {
    children: JSX.Element|JSX.Element[],
    covered: boolean,
}

export default function Frame(props: IProps) {
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