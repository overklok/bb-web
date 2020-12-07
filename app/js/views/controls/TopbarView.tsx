import * as React from "react";

import {ViewEvent} from "../../core/base/Event";
import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";

import MissionLi from "./topbar/MissionLi";
import {scrollTo} from "../../core/helpers/functions";

require('../../../css/blocks/menu/navbar.less')
require('../../../css/blocks/menu/progressbar.less')
require('../../../css/blocks/menu/pager.less')
require('../../../css/blocks/generic/btn.less')
require('../../../css/blocks/generic/cask.less')

export namespace TopbarView {
    export interface Props extends IViewProps {
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
        constructor(props: AllProps<Props>) {
            super(props);

            this.onScrollableUpdate = this.onScrollableUpdate.bind(this);
        }

        private onScrollableUpdate(ref: HTMLElement) {
            if (!ref) return;

            let scroll_pos = ref.scrollLeft;

            ref.addEventListener('wheel', function(e) {
                if (e.deltaY > 0) {
                    scroll_pos = scroll_pos - 40;
                }

                if (e.deltaY < 0) {
                    scroll_pos = scroll_pos + 40;
                }

                if (scroll_pos < 0) scroll_pos = 0;
                if (scroll_pos > ref.scrollWidth - ref.offsetWidth) scroll_pos = ref.scrollWidth - ref.offsetWidth;

                scrollTo(ref,  scroll_pos, () => {
                    scroll_pos = ref.scrollLeft;
                });
            });
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
                                <div className="pager__arrow pager__arrow_left"/>
                                <div className="pager__listwrap">
                                    <ul className="pager__list" ref={this.onScrollableUpdate}>
                                        <MissionLi caption='1' />
                                        <MissionLi caption='2' />
                                        <MissionLi caption='3' />
                                        <MissionLi caption='4' />
                                        <MissionLi caption='5' />
                                        <MissionLi caption='6' />
                                        <MissionLi caption='7' />
                                        <MissionLi caption='8' />
                                        <MissionLi caption='9' />
                                        <MissionLi caption='A' />
                                        <MissionLi caption='B' />
                                        <MissionLi caption='C' />
                                        <MissionLi caption='D' />
                                        <MissionLi caption='E' />
                                        <MissionLi caption='F' />
                                        <MissionLi caption='G' />

                                    </ul>
                                </div>
                                <div className="pager__arrow pager__arrow_right"/>
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