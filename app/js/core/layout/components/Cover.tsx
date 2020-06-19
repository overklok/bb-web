import * as React from "react";
import classNames from "classnames";

interface IProps {
    enabled: boolean
}

export default function Cover(props: IProps) {
    const klasses_wrap = classNames({
        'cover': true,
        'cover_enabled': props.enabled
    });

    return (
        <div className={klasses_wrap} />
    )
}