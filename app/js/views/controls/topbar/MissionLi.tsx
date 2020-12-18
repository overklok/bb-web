import * as React from "react";

import Portal from "../../../core/base/view/Portal";
import MissionContextMenu, {Exercise} from "./MissionContextMenu";
import CaskProgress from "./CaskProgress";
import classNames from "classnames";

require('../../../../css/blocks/menu/mission.less');
require('../../../../css/blocks/menu/combolist.less');

export interface MissionProgress {
    exercise_idx: number;
    exercise_idx_last: number;
    exercise_idx_passed: number;
    exercise_idx_passed_max: number;
    exercise_idx_available: number;
}

interface MissionLiProps {
    index: number;
    exercises: Exercise[];

    title: string;
    description: string;
    progress: MissionProgress;

    is_current: boolean;

    on_click?: () => void;
    on_restart?: () => void;
    on_forward?: () => void;
    on_exercise_select?: (idx: number) => void;
}

interface MissionLiState {
    ctxmenu_active: boolean;
    hovered: boolean;
    pos_x: number;
    pos_y: number;
}

export default class MissionLi extends React.Component<MissionLiProps, MissionLiState> {
    private readonly ref_root: React.RefObject<HTMLDivElement>;

    constructor(props: MissionLiProps) {
        super(props);

        this.state = {
            ctxmenu_active: false,
            pos_x: undefined,
            pos_y: undefined,
            hovered: false,
        };

        this.ref_root = React.createRef();

        this.handleClick                = this.handleClick.bind(this);
        this.handleContextMenu          = this.handleContextMenu.bind(this);
        this.handleMissionClick         = this.handleMissionClick.bind(this);
        this.handleContextMenuGlobal    = this.handleContextMenuGlobal.bind(this);
    }

    componentDidMount() {
        document.addEventListener("contextmenu", this.handleContextMenuGlobal);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClick);
        document.removeEventListener("contextmenu", this.handleContextMenuGlobal);
    }

    /**
     * Handle user left-click on the mission button
     *
     * @param e event object provided by React
     */
    handleMissionClick(e: React.MouseEvent) {
        if (this.props.is_current) {
            if (this.isProgressDetached()) {
                // On detached currently active mission,
                // forward to the last exercise available in the mission
                this.props.on_forward && this.props.on_forward();
            } else {
                // On synced currently active mission,
                // restart the mission from the first exercise
                this.props.on_restart && this.props.on_restart();
            }
        }

        this.props.on_click && this.props.on_click();
    }

    /**
     * Handle user left-click globally
     *
     * Close all context menu instances opened at the moment
     * except context menu which is currently active
     *
     * @param e event object provided by the web API
     */
    handleClick(e: MouseEvent) {
        if (this.state.ctxmenu_active) {
            this.setState({ctxmenu_active: false});

            // Detach itself (attached previously by {@see handleContextMenu})
            document.removeEventListener("click", this.handleClick);
        }
    }

    /**
     * Handle context menu event
     * Reject if fired not in the component
     *
     * @param e event object provided by React
     */
    handleContextMenu(e: React.MouseEvent) {
        if (this.state.ctxmenu_active) return;

        e.preventDefault();

        // Attach left-click global handler to close when user clicks outside the menu
        // (it will be self-detached after execution)
        document.addEventListener("click", this.handleClick);

        const {top, left} = this.ref_root.current.getBoundingClientRect();

        this.setState({
            pos_x: left,
            pos_y: top,
            ctxmenu_active: true
        });
    }

    /**
     * Handle context menu event globally
     *
     * Close all context menu instances opened at the moment
     * Open context menu instance related to the component
     *
     * @param e event object provided by the web API
     */
    handleContextMenuGlobal(e: MouseEvent) {
        if (!this.state.ctxmenu_active) return;

        const index = (e.target as any).getAttribute('data-index');

        console.log(e.target, this.props.index, Number(index));

        if (Number(index) !== this.props.index) {
            this.setState({ctxmenu_active: false});
            document.removeEventListener("click", this.handleClick);
        }
    }

    render() {
        const progress = this.props.progress;
        const exercise_num_total = progress.exercise_idx_last + 1;
        let exercise_num_current = 0;
        let detached = true;

        if (progress.exercise_idx_passed_max === progress.exercise_idx_passed) {
            // Synced indices: user follows mission without switching to previous exercises
            exercise_num_current = progress.exercise_idx_passed + 1;
            detached = false;
        } else if (progress.exercise_idx_available < progress.exercise_idx) {
            // Admin switching: show progress as if user follows without skipping
            exercise_num_current = progress.exercise_idx + 1;
        } else {
            // User switching: do not show that current exercise was passed
            exercise_num_current = progress.exercise_idx;
        }

        let perc_pass  = 100 * exercise_num_current / exercise_num_total;
        let perc_avail = 100 * (progress.exercise_idx_passed_max + 1) / exercise_num_total;

        const {is_current} = this.props;

        const klasses_pager__item = classNames({
            'pager__item': true,
            'pager__item_starred': progress.exercise_idx_passed == progress.exercise_idx_last,
            'pager__item_active': true,
            'pager__item_current': this.props.is_current,
        });

        const klasses_cask = classNames({
            'cask': true,
            'cask_bg_warning-weak': is_current,
        });

        const klasses_cask__content_main = classNames({
            'cask__content': true,
            'cask__content_disposable': is_current
        });

        const klasses_cask_content_alt = classNames({
            'cask__content': true,
            'cask__content_undisposable': is_current
        });

        const is_simple_force = progress.exercise_idx_last == 0;

        return (
            <li className={klasses_pager__item}>
                <div className={klasses_cask}>
                    {detached ? <CaskProgress is_simple_force={is_simple_force}
                                              percent={perc_avail} is_simple={!is_current}
                                              style_fg={is_current ? 'primary-weak' : 'primary-weak'}
                                              style_bg={is_current ? 'warning-weak' : null}
                                />
                              : null
                    }
                    <CaskProgress is_simple_force={is_simple_force}
                                  percent={perc_pass} is_simple={detached || !is_current}
                                  style_fg={is_current ? 'success' : 'success-weak'}
                                  style_bg={is_current ? 'warning-weak' : null}
                    />

                    <div ref={this.ref_root}
                         className={klasses_cask__content_main}
                         onClick={this.handleMissionClick}
                         onContextMenu={this.handleContextMenu}
                         data-index={this.props.index}
                    >
                        {this.props.index + 1}
                    </div>

                    {this.props.is_current ?
                        <div className={klasses_cask_content_alt}
                             onClick={this.handleMissionClick}
                             onContextMenu={this.handleContextMenu}
                        >
                            {this.getActiveIcon()}
                        </div>
                    : null}

                    <Portal>
                        <MissionContextMenu index={this.props.index}
                                            visible={this.state.ctxmenu_active}
                                            btn_pos_x={this.state.pos_x}
                                            btn_pos_y={this.state.pos_y}
                                            percent={perc_pass}

                                            exercises={this.props.exercises}

                                            title={this.props.title}
                                            description={this.props.description}
                                            current_exercise_idx={this.props.progress.exercise_idx}
                                            on_exercise_select={this.props.on_exercise_select}
                        />
                    </Portal>
                </div>
            </li>
        )
    }

    private getActiveIcon() {
        if (this.isProgressDetached()) {
            // On detached currently active mission, suggest the user to
            // forward to the last exercise available in the mission
            return <i className="fa fa-fast-forward" aria-hidden="true"/>
        } else {
            // On synced currently active mission, suggest the user to
            // restart the mission from the first exercise
            return <i className="fa fa-redo-alt" aria-hidden="true"/>
        }
    }

    /**
     * Determine whether user follows the mission' exercises consistently.
     * If user switches manually, this method returns `false`.
     *
     * @private
     */
    private isProgressDetached() {
        const progress = this.props.progress;
        return progress.exercise_idx_available !== progress.exercise_idx;
    }
}

