import classNames from "classnames";
import * as React from "react";
import {clamp} from "../../../core/helpers/functions";

interface ICaskProgressProps {
    percent: number;
    simple?: boolean;
    simple_force?: boolean;
    light?: boolean;
}

const CaskProgress = (props: ICaskProgressProps) => {
    const progress_percent = 100 - clamp(0, 100, props.percent);

    const klasses_wavefront: {[key: string]: boolean} = {
        'wavefront': true,
        'wavefront_disabled': props.simple || progress_percent == 0, // deactivate animation when full
        'wavefront_light': props.light
    };

    const klasses_cask_progress = classNames({
        'cask__progress': true,
        'cask__progress_light': props.light
    })

    return (
        <div className={klasses_cask_progress} style={{bottom: `-${progress_percent}%`}}>
            {props.simple_force ? null : (
                <div className={classNames(klasses_wavefront)}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}

            {props.simple_force ? null : (
                <div className={classNames({...klasses_wavefront, 'wavefront_alt': true})}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}
        </div>
    )
}

export default CaskProgress;