import * as React from "react";
import classNames from "classnames";

interface IProps {
    enabled: boolean,
    title?: string,
    image?: string,
}

export default function Cover(props: IProps) {
    const klasses_wrap = classNames({
        'cover': true,
        'cover_enabled': props.enabled
    });

    return (
        <div className={klasses_wrap}>
            <div className='cover__block'>
                <img className='cover__img'
                     src={props.image || ""}
                     alt=""
                >
                </img>
                <p>{props.title || "untitled"}</p>
            </div>
        </div>
    )
}