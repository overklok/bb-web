import classNames from "classnames";
import * as React from "react";
import {clamp} from "../../../core/helpers/functions";

interface ICaskProgressProps {
    percent: number;
    is_simple?: boolean;
    is_simple_force?: boolean;
    style_bg?: 'warning-weak' | 'light';
    style_fg?: 'success' | 'success-weak' | 'primary' | 'primary-weak';
}

const CaskProgress = (props: ICaskProgressProps) => {
    const {is_simple, is_simple_force, style_bg, style_fg} = props;

    const progress_percent = 100 - clamp(0, 100, props.percent);

    const klasses_cask_progress: {[key: string]: boolean} = {
        'cask__progress': true,
    };

    if (style_fg) {
        klasses_cask_progress[`cask__progress_bg_${style_fg}`] = true;
    }

    const klasses_wavefront: {[key: string]: boolean} = {
        'wavefront': true,
        'wavefront_disabled': is_simple || progress_percent == 0, // deactivate animation when full
    };

    if (style_bg) {
        klasses_wavefront[`wavefront_bg_${style_bg}`] = true;
    }

    if (style_fg) {
        klasses_wavefront[`wavefront_fg_${style_fg}`] = true;
    }

    return (
        <div className={classNames(klasses_cask_progress)} style={{bottom: `-${progress_percent}%`}}>
            {is_simple_force ? null : (
                <div className={classNames(klasses_wavefront)}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}

            {is_simple_force ? null : (
                <div className={classNames({...klasses_wavefront, 'wavefront_alt': true})}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}
        </div>
    )
}

export default CaskProgress;