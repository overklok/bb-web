import classNames from "classnames";
import * as React from "react";
import {clamp} from "../../../core/helpers/functions";

/**
 * Props for {@link CaskProgress}
 */
interface ICaskProgressProps {
    /** percentage of foreground-filled area, from 0 to 1 */
    percent: number;
    /** enable wave animation on top of the foreground-filled area */
    is_animated?: boolean;
    /** do not render wave fronts used for the animation (the animation wouldn't be toggled smoothly) */
    no_animation?: boolean;
    /** background color preference */
    style_bg?: 'warning-weak' | 'light';
    /** foreground color preference (including the waves) */
    style_fg?: 'success' | 'success-weak' | 'primary' | 'primary-weak';
}

/**
 * Mission progress bar
 * 
 * Used as a background for mission button, {@link MissionLi}.
 * 
 * Visually represented as a rectangular area filled by a rectangle 
 * of the same width, growing in height from the bottom as the 
 * required percentage increases.
 * 
 * On the top of the rectangle, some animated particles are rendered
 * for a wave effect.
 */
const CaskProgress = (props: ICaskProgressProps) => {
    const {is_animated, no_animation, style_bg, style_fg} = props;

    const progress_percent = 100 - clamp(0, 100, props.percent);

    const klasses_cask_progress: {[key: string]: boolean} = {
        'cask__progress': true,
    };

    if (style_fg) {
        klasses_cask_progress[`cask__progress_bg_${style_fg}`] = true;
    }

    const klasses_wavefront: {[key: string]: boolean} = {
        'wavefront': true,
        'wavefront_disabled': is_animated || progress_percent == 0, // deactivate the animation when the progress is full
    };

    if (style_bg) {
        klasses_wavefront[`wavefront_bg_${style_bg}`] = true;
    }

    if (style_fg) {
        klasses_wavefront[`wavefront_fg_${style_fg}`] = true;
    }

    return (
        <div className={classNames(klasses_cask_progress)} style={{bottom: `-${progress_percent}%`}}>
            {no_animation ? null : (
                <div className={classNames(klasses_wavefront)}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}

            {no_animation ? null : (
                <div className={classNames({...klasses_wavefront, 'wavefront_alt': true})}>
                    <div className="wavefront__wave wavefront__wave_left"></div>
                    <div className="wavefront__wave wavefront__wave_right"></div>
                </div>
            )}
        </div>
    )
}

export default CaskProgress;