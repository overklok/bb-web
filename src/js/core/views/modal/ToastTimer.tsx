import * as React from "react";
import classNames from "classnames";
import {ColorAccent} from "../../helpers/styles";

require("../../../../css/core/timer.less");

interface Props {
    timeout: number;
    is_hidden: boolean;
    is_paused: boolean;
    on_finish: Function;
    className: string;
    color: ColorAccent;
}

export function ToastTimer(props: Props) {
    const pb_style = {
        animationDuration: `${props.timeout}ms`,
        animationPlayState: props.is_paused ? 'paused' : 'running',
        opacity: 1
    };

    const klasses = classNames({
        [props.className]: true,
        'timer': true,
        'timer_animated': props.timeout,
        [`timer_${props.color}`]: true,
    });

    return <div
            className={klasses}
            style={pb_style}
            onAnimationEnd={() => props.on_finish && props.on_finish()}
    />
}