import * as React from "react";
import classNames from "classnames";
import CaskProgress from "./CaskProgress";
import {CSSTransition} from "react-transition-group";

export interface Exercise {
    id: number;
    name: string;
}

interface MCMProps {
    index: number;
    visible: boolean;
    btn_pos_x: number;
    btn_pos_y: number;
    percent: number;
    title: string;
    description: string;
    exercises: Exercise[];
    current_exercise_idx: number;
    on_exercise_select?: (idx: number) => void;
}

interface MCMState {
    corr_x: number;
    corr_y: number;
}

export default class MissionContextMenu extends React.Component<MCMProps, MCMState> {
    static defaultProps = {
        visible: false,
    }

    private readonly ref_cont: React.RefObject<HTMLDivElement>;
    private readonly ref_cask: React.RefObject<HTMLDivElement>;

    constructor(props: MCMProps) {
        super(props);

        this.ref_cont = React.createRef();
        this.ref_cask = React.createRef();

        this.state = {
            corr_x: 0,
            corr_y: 0
        }
    }

    handleExerciseClick(idx: number) {
        this.props.on_exercise_select && this.props.on_exercise_select(idx);
    }

    render() {
        let reverse_head = false;

        let pos_x = 0, pos_y = 0;
        let dx = 0;

        if (this.ref_cont.current) {
            if (this.props.btn_pos_x) pos_x = this.props.btn_pos_x - dx;
            if (this.props.btn_pos_y) pos_y = this.props.btn_pos_y;

            const {width: g_width} = document.body.getBoundingClientRect();
            const {width: cont_width} = this.ref_cont.current.getBoundingClientRect();
            const {width: cask_width} = this.ref_cask.current.getBoundingClientRect();

            if (this.props.btn_pos_x && (this.props.btn_pos_x + cont_width > g_width)) {
                dx = cont_width - cask_width;
                reverse_head = true;
            }
        }

        if (this.props.btn_pos_x) pos_x = this.props.btn_pos_x - dx;
        if (this.props.btn_pos_y) pos_y = this.props.btn_pos_y;

        const klasses_head = classNames({
            'mission__head': true,
            'mission__head_reversed': reverse_head,
        });

        return (
            <CSSTransition in={this.props.visible} timeout={300}>
                <div className="mission" style={{left: pos_x, top: pos_y}} ref={this.ref_cont}>
                    <div className={klasses_head}>
                        <div className="mission__dropcap">
                            <div className="cask cask_success" ref={this.ref_cask}>
                                <CaskProgress percent={this.props.percent} simple={true} />

                                <div className="cask__content">
                                    {this.props.index + 1}
                                </div>
                            </div>
                        </div>
                        <div className="mission__brief">
                            <div className="mission__title">
                                {this.props.title}
                            </div>
                            <div className="mission__subtitle">
                                {this.props.description}
                            </div>
                        </div>
                    </div>
                    <div className="mission__body">
                        <ul className='combolist'>
                            {this.props.exercises.map((exercise, idx) => {
                                const klasses = classNames({
                                    'combolist__item': true,
                                    'cl-item': true,
                                    'cl-item_active': idx == this.props.current_exercise_idx
                                });

                                return (
                                    <li key={idx}
                                        className={klasses}
                                        onClick={() => this.handleExerciseClick(idx)}
                                    >
                                        <div className="cl-item__prefix">
                                            {idx + 1}
                                        </div>

                                        <div className="cl-item__caption">
                                            {exercise.name}
                                        </div>

                                        {/*TODO: Add actions later*/}
                                        {/*<div className="cl-item__context cl-context">*/}
                                        {/*    <div className="cl-context__action">*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                    </li>
                                    )
                                }
                            )}
                        </ul>
                    </div>
                </div>
            </CSSTransition>
        )
    }
}