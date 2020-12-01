import * as React from "react";

import {ViewEvent} from "../../core/base/Event";
import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";

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

            ref.addEventListener('wheel', function(e) {
                if (e.deltaY > 0) {
                    ref.scrollTo(ref.scrollLeft + 10, 0);
                }

                if (e.deltaY < 0) {
                    ref.scrollTo(ref.scrollLeft + 10, 0);
                }
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
                                        <li className="pager__item cask">1</li>
                                        <li className="pager__item cask">2</li>
                                        <li className="pager__item cask">3</li>
                                        <li className="pager__item cask">4</li>
                                        <li className="pager__item cask">5</li>
                                        <li className="pager__item cask">6</li>
                                        <li className="pager__item cask">7</li>
                                        <li className="pager__item cask">8</li>
                                        <li className="pager__item cask">9</li>
                                        <li className="pager__item cask">A</li>
                                        <li className="pager__item cask">B</li>
                                        <li className="pager__item cask">C</li>
                                        <li className="pager__item cask">D</li>
                                        <li className="pager__item cask">E</li>
                                        <li className="pager__item cask">F</li>
                                        <li className="pager__item cask">G</li>
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