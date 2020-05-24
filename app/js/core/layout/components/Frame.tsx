import * as React from "react";
import {useDrop} from "react-dnd";
import {DraggableItemTypes} from "../types";

interface IProps {
    children: JSX.Element|JSX.Element[]
}

export default function Frame(props: IProps) {
    const [{is_over}, drop] = useDrop({
        accept: DraggableItemTypes.Tab,
        drop: () => {},
        collect: monitor => ({
            is_over: !!monitor.isOver(),
        }),
    });

    return (
        <div className='frame' ref={drop}>
            {props.children}
        </div>
    )
}