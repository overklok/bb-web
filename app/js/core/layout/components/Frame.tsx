import * as React from "react";

interface IProps {
    children: JSX.Element // usually a Nest creators
}

export default function Frame(props: IProps) {

    return (
        <div className='frame'>
            {props.children}
        </div>
    )
}