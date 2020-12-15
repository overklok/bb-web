import classNames from "classnames";
import * as React from "react";
import {clamp} from "../../../core/helpers/functions";

interface ICaskProgressProps {
    percent: number;
    simple?: boolean;
    simple_force?: boolean;
    color_modifier?: 'secondary'|'success'|'warning'|'error';
}

const CaskProgress = (props: ICaskProgressProps) => {
    const color_modifier = props.color_modifier || 'success';

    const progress_percent = 100 - clamp(0, 100, props.percent);

    const klasses_wavefront: {[key: string]: boolean} = {
        'wavefront': true,
        'wavefront_disabled': props.simple || progress_percent == 0, // deactivate animation when full
    };

    klasses_wavefront[`wavefront_${color_modifier}`] = true;

    return (
        <div className={`cask__progress cask__progress_${color_modifier}`} style={{bottom: `-${progress_percent}%`}}>
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