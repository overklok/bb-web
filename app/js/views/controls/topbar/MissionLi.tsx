import * as React from "react";

import Portal from "../../../core/base/view/Portal";
import MissionContextMenu, {Exercise} from "./MissionContextMenu";
import CaskProgress from "./CaskProgress";
import classNames from "classnames";

require('../../../../css/blocks/menu/mission.less');
require('../../../../css/blocks/menu/combolist.less');

export interface MissionProgress {
    exercise_idx: number;
    exercise_idx_passed: number;
    exercise_idx_available: number;
    exercise_last: number;
}

interface MissionLiProps {
    index: number;
    exercises: Exercise[];

    title: string;
    active: boolean;
    description: string;
    progress: MissionProgress;

    on_click?: () => void;
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

    handleMissionClick(e: React.MouseEvent) {
        this.props.on_click && this.props.on_click();
    }

    handleClick(e: MouseEvent) {
        if (this.state.ctxmenu_active) {
            this.setState({ctxmenu_active: false});
            document.removeEventListener("click", this.handleClick);
        }
    }

    handleContextMenu(e: React.MouseEvent) {
        if (this.state.ctxmenu_active) return;

        e.preventDefault();

        document.addEventListener("click", this.handleClick);

        const {top, left} = this.ref_root.current.getBoundingClientRect();

        this.setState({
            pos_x: left,
            pos_y: top,
            ctxmenu_active: true
        });
    }

    handleContextMenuGlobal(e: MouseEvent) {
        if (!this.state.ctxmenu_active) return;

        const index = (e.target as any).getAttribute('data-index');

        if (Number(index) !== this.props.index) {
            this.setState({ctxmenu_active: false});
            document.removeEventListener("click", this.handleClick);
        }
    }

    render() {
        const progress = this.props.progress;
        const exercise_num_total = progress.exercise_last + 1;
        let exercise_num_current = 0;
        let synced = false;

        if (progress.exercise_idx_available === progress.exercise_idx) {
            // Synced indices: user follows mission without switching to previous exercises
            exercise_num_current = progress.exercise_idx_passed + 1;

            synced = true;
        } else if (progress.exercise_idx_available < progress.exercise_idx) {
            // Admin switching: show progress as if user follows without skipping
            exercise_num_current = progress.exercise_idx + 1;
        } else {
            // User switching: do not show that current exercise was passed
            exercise_num_current = progress.exercise_idx;
        }

        const perc_pass  = 100 * exercise_num_current / exercise_num_total;
        const perc_avail = 100 * ((progress.exercise_idx_passed + 1) / exercise_num_total);

        const klasses_cask = classNames({
            'pager__item': true,
            'cask': true,
            'cask_active': true,
            'cask_selected': this.props.active,
        })

        const klasses_cask_content_main = classNames({
            'cask__content': true,
            'cask__content_disposable': this.props.active
        });

        const klasses_cask_content_alt = classNames({
            'cask__content': true,
            'cask__content_undisposable': this.props.active
        });

        return (
            <li className={klasses_cask}>
                {!synced ?
                    <CaskProgress percent={perc_avail} light />
                    : null
                }
                <CaskProgress percent={perc_pass} simple={!synced || !this.props.active} />

                <div ref={this.ref_root}
                     className={klasses_cask_content_main}
                     onClick={this.handleMissionClick}
                     onContextMenu={this.handleContextMenu}
                     data-index={this.props.index}
                >
                    {this.props.index + 1}
                </div>

                {this.props.active ?
                    <div className={klasses_cask_content_alt}
                         onClick={this.handleMissionClick}
                         onContextMenu={this.handleContextMenu}
                         data-index={this.props.index}
                    >
                        <i className="fa fa-redo-alt" aria-hidden="true"/>
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
            </li>
        )
    }
}

