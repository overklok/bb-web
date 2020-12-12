import * as React from "react";

import {ViewEvent} from "../../core/base/Event";
import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";

import MissionLi, {MissionProgress} from "./topbar/MissionLi";
import {scrollTo} from "../../core/helpers/functions";
import {Exercise} from "./topbar/MissionContextMenu";

require('../../../css/blocks/menu/navbar.less')
require('../../../css/blocks/menu/progressbar.less')
require('../../../css/blocks/menu/pager.less')
require('../../../css/blocks/generic/btn.less')
require('../../../css/blocks/generic/cask.less')

interface Mission {
    id: number;
    name: string;
    description: string;
    exercises: Exercise[];
}

interface Progress {
    mission_idx: number;
    mission_idx_last: number;
    missions: MissionProgress[];
}

export namespace TopbarView {
    export interface Props extends IViewProps {
        missions: Mission[],
        progress: Progress
    }

    export interface State extends IViewState {

    }

    export class MissionSelectEvent extends ViewEvent<MissionSelectEvent> {
        mission_idx: number;
    }

    export class ExerciseSelectEvent extends ViewEvent<ExerciseSelectEvent> {
        mission_idx: number;
        exercise_idx: number;
    }

    export class StatusClickEvent extends ViewEvent<StatusClickEvent> {
    }

    export class TopbarView extends View<Props, State> {
        private el_scrollable: HTMLElement;

        constructor(props: AllProps<Props>) {
            super(props);

            this.onScrollableUpdate = this.onScrollableUpdate.bind(this);
        }

        private onScrollableUpdate(el: HTMLElement) {
            if (!el) return;

            this.el_scrollable = el;

            let scroll_pos = el.scrollLeft;

            el.addEventListener('wheel', function(e) {
                if (e.deltaY > 0) {
                    scroll_pos = scroll_pos - 40;
                }

                if (e.deltaY < 0) {
                    scroll_pos = scroll_pos + 40;
                }

                if (scroll_pos < 0) scroll_pos = 0;
                if (scroll_pos > el.scrollWidth - el.offsetWidth) scroll_pos = el.scrollWidth - el.offsetWidth;

                scrollTo(el,  scroll_pos, () => {
                    scroll_pos = el.scrollLeft;
                });
            });
        }

        private scrollToBegin() {
            if (!this.el_scrollable) return;

            scrollTo(this.el_scrollable, 0);
        }

        private scrollToEnd() {
            if (!this.el_scrollable) return;

            scrollTo(this.el_scrollable, this.el_scrollable.scrollWidth);
        }

        private chooseMission(mission_idx: number) {
            this.emit(new MissionSelectEvent({mission_idx}));
        }

        private chooseExercise(mission_idx: number, exercise_idx: number) {
            this.emit(new ExerciseSelectEvent({mission_idx, exercise_idx}));
        }

        public render(): React.ReactNode {
            return (
                <React.Fragment>
                    <div className="navbar">
                        <div className="navbar__section">
                            <div className="btn btn_primary btn_contoured">Menu</div>
                        </div>
                        <div className="navbar__section">
                            <h2 className='navbar__title'>Tapanda</h2>
                        </div>
                        <div className="navbar__delimiter"/>
                        <div className="navbar__section">
                            <h2 className='navbar__title'>Lesson Title</h2>
                        </div>
                        <div className="navbar__spacer"/>
                        <div className="navbar__section navbar__section_half">
                            <div className="pager">
                                <div className="pager__arrow pager__arrow_left" onClick={() => this.scrollToBegin()}/>
                                <div className="pager__listwrap">
                                    <ul className="pager__list" ref={this.onScrollableUpdate}>
                                        {this.props.missions.map((mission, idx) =>
                                            <MissionLi key={idx}
                                                       index={idx}
                                                       exercises={mission.exercises}
                                                       title={mission.name}
                                                       description={mission.description}
                                                       progress={this.props.progress.missions[idx]}
                                                       on_click={() => this.chooseMission(idx)}
                                                       on_exercise_select={e_idx => this.chooseExercise(idx, e_idx)}
                                            />
                                        )}
                                    </ul>
                                </div>
                                <div className="pager__arrow pager__arrow_right" onClick={() => this.scrollToEnd()}/>
                            </div>
                        </div>
                    </div>
                    <div className="progressbar">

                    </div>
                </React.Fragment>
            )
        }
    }
}