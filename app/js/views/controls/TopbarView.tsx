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
                                        <MissionLi caption='1' progress={0}/>
                                        <MissionLi caption='2' progress={0}/>
                                        <MissionLi caption='3' progress={0}/>
                                        <MissionLi caption='4' progress={0}/>
                                        <MissionLi caption='5' progress={10}/>
                                        <MissionLi caption='6' progress={20}/>
                                        <MissionLi caption='7' progress={30}/>
                                        <MissionLi caption='8' progress={40}/>
                                        <MissionLi caption='9' progress={50}/>
                                        <MissionLi caption='A' progress={60}/>
                                        <MissionLi caption='B' progress={70}/>
                                        <MissionLi caption='C' progress={80}/>
                                        <MissionLi caption='D' progress={90}/>
                                        <MissionLi caption='E' progress={100}/>
                                        <MissionLi caption='F' progress={90}/>
                                        <MissionLi caption='G' progress={80}/>
                                        <MissionLi caption='H' progress={70}/>
                                        <MissionLi caption='I' progress={60}/>
                                        <MissionLi caption='J' progress={50}/>
                                        <MissionLi caption='K' progress={40}/>
                                        <MissionLi caption='L' progress={30}/>
                                        <MissionLi caption='M' progress={20}/>
                                        <MissionLi caption='N' progress={10}/>
                                        <MissionLi caption='O' progress={0}/>
                                        <MissionLi caption='P' progress={10}/>
                                        <MissionLi caption='Q' progress={20}/>
                                        <MissionLi caption='R' progress={30}/>
                                        <MissionLi caption='S' progress={40}/>
                                        <MissionLi caption='T' progress={50}/>
                                        <MissionLi caption='U' progress={60}/>
                                        <MissionLi caption='V' progress={70}/>
                                        <MissionLi caption='W' progress={80}/>
                                        <MissionLi caption='X' progress={90}/>
                                        <MissionLi caption='Y' progress={100}/>
                                        <MissionLi caption='Z' progress={100}/>
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