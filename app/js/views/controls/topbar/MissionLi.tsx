import * as React from "react";

import Portal from "../../../core/base/view/Portal";
import MissionContextMenu, {Exercise} from "./MissionContextMenu";
import CaskProgress from "./CaskProgress";

require('../../../../css/blocks/menu/mission.less');
require('../../../../css/blocks/menu/combolist.less');

export interface MissionProgress {
    exercise_idx: number;
    exercise_idx_available: number;
    exercise_last: number;
}

interface MissionLiProps {
    index: number;
    exercises: Exercise[];

    title: string;
    description: string;
    progress: MissionProgress;

    on_click?: () => void;
    on_exercise_select?: (idx: number) => void;
}

interface MissionLiState {
    ctxmenu_active: boolean;
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
        };

        this.ref_root = React.createRef();

        this.handleClick                = this.handleClick.bind(this);
        this.handleContextMenu          = this.handleContextMenu.bind(this);
        this.handleContextMenuGlobal    = this.handleContextMenuGlobal.bind(this);

        this.handleMissionClick = this.handleMissionClick.bind(this);
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

        if (e.target !== this.ref_root.current) {
            this.setState({ctxmenu_active: false});
            document.removeEventListener("click", this.handleClick);
        }
    }

    render() {
        const progress = this.props.progress;

        const percentage = 100 * (progress.exercise_idx_available / progress.exercise_last);

        return (
            <li className="pager__item cask cask_active cask_cl_success" >
                <CaskProgress percent={percentage} simple={true} />

                <div ref={this.ref_root}
                     className="cask__content"
                     onClick={this.handleMissionClick}
                     onContextMenu={this.handleContextMenu}
                >
                    {this.props.index + 1}
                </div>

                <Portal>
                    <MissionContextMenu index={this.props.index}
                                        visible={this.state.ctxmenu_active}
                                        btn_pos_x={this.state.pos_x}
                                        btn_pos_y={this.state.pos_y}
                                        percent={percentage}

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

