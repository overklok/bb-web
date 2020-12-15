import classNames from "classnames";
import * as React from "react";
import {clamp} from "../../../core/helpers/functions";

interface ICaskProgressProps {
    percent: number;
    simple?: boolean;
}

const CaskProgress = (props: ICaskProgressProps) => {
    const progress_percent = 100 - clamp(0, 100, props.percent);

    const klasses_wavefront = {
        'wavefront': true,
        'wavefront_success': true,
        'wavefront_disabled': progress_percent == 0, // deactivate animation when full
    };

    return (
        <div className="cask__progress cask__progress_success" style={{bottom: `-${progress_percent}%`}}>
            {props.simple ? null : (
                <div className={classNames(klasses_wavefront)}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}

            {props.simple ? null : (
                <div className={classNames({...klasses_wavefront, 'wavefront_alt': true})}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}
        </div>
    )
}

export default CaskProgress;