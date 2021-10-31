import * as React from "react";
import classNames from "classnames";

/**
 * @category Core.UI
 * 
 * @component
 */
interface CoverProps {
    enabled: boolean,
    title?: string,
    image?: string,
}

/**
 * @category Core.UI
 * 
 * @component
 */
export default function Cover(props: CoverProps) {
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