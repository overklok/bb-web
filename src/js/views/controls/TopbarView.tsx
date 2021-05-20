import * as React from "react";

import {ViewEvent} from "../../core/base/Event";
import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";

import MissionLi, {MissionProgress} from "./topbar/MissionLi";
import {scrollTo} from "../../core/helpers/functions";
import {Exercise} from "./topbar/MissionContextMenu";
import classNames from "classnames";
import StatusIndicator, {ConnectionStatus} from "./topbar/StatusIndicator";

require('css/logo.less');
require('css/blocks/menu/navbar.less');
require('css/blocks/menu/pager.less');
require('css/blocks/menu/indicator.less');
require('css/blocks/menu/progressbar.less');
require('css/blocks/generic/btn.less');
require('css/blocks/generic/cask.less');
require('css/blocks/generic/wavefront.less');

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

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

export const enum MenuItem {
    Lessons = 'lessons',
    Settings = 'settings',
    Developer = 'developer',
    Execute = 'execute'
}

namespace TopbarView {
    export interface Props extends IViewProps {
        missions: Mission[];
        progress: Progress;
        lesson_title: string;
        status: ConnectionStatus;
        is_demo: boolean;
        admin_url_prefix: string;
    }

    export interface State extends IViewState {
        menu_active: boolean;
    }

    export class MissionSelectEvent extends ViewEvent<MissionSelectEvent> {
        mission_idx: number;
    }

    export class MissionRestartEvent extends ViewEvent<MissionRestartEvent> {
        mission_idx: number;
    }

    export class MissionForwardEvent extends ViewEvent<MissionRestartEvent> {
        mission_idx: number;
    }

    export class ExerciseSelectEvent extends ViewEvent<ExerciseSelectEvent> {
        mission_idx: number;
        exercise_idx: number;
    }

    export class MenuItemEvent extends ViewEvent<MenuItemEvent> {
        item: MenuItem;
    }

    export class TopbarView extends View<Props, State> {
        private el_scrollable: HTMLElement;

        constructor(props: AllProps<Props>) {
            super(props);

            this.toggleMenu = this.toggleMenu.bind(this);
            this.onScrollableUpdate = this.onScrollableUpdate.bind(this);

            this.state = {
                menu_active: false,
            };
        }

        componentDidUpdate() {
            this.scrollToCurrentItem();
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

            const pos_cur = this.getCurrentScrollPosition();
            const pos_pref = this.getPreferredScrollPosition();

            if (pos_cur - 10 > pos_pref) {
                scrollTo(this.el_scrollable, pos_pref);
            } else {
                scrollTo(this.el_scrollable, 0);
            }
        }

        private scrollToEnd() {
            if (!this.el_scrollable) return;

            const pos_cur = this.getCurrentScrollPosition();
            const pos_pref = this.getPreferredScrollPosition();

            if (pos_cur + 10 < pos_pref) {
                scrollTo(this.el_scrollable, pos_pref);
            } else {
                scrollTo(this.el_scrollable, this.el_scrollable.scrollWidth);
            }
        }

        private scrollToCurrentItem() {
            if (!this.el_scrollable) return;

            this.el_scrollable.scrollTo({
                left: this.getPreferredScrollPosition(),
                behavior: 'smooth'
            });
        }

        private chooseMission(mission_idx: number) {
            this.emit(new MissionSelectEvent({mission_idx}));
        }

        private restartMission(mission_idx: number) {
            this.emit(new MissionRestartEvent({mission_idx}));
        }

        private forwardMission(mission_idx: number) {
            this.emit(new MissionForwardEvent({mission_idx}));
        }

        private chooseExercise(mission_idx: number, exercise_idx: number) {
            this.emit(new ExerciseSelectEvent({mission_idx, exercise_idx}));
        }

        private toggleMenu() {
            this.setState({
                menu_active: !this.state.menu_active
            });
        }

        private chooseMenuItem(item: MenuItem) {
            this.emit(new MenuItemEvent({item}));
        }

        public render(): React.ReactNode {
            const menu_btn_klasses = classNames({
                'btn': true,
                'btn_primary': !this.props.is_demo,
                'btn_secondary': this.props.is_demo,
                'btn_contoured': true,
                'btn_inv': this.state.menu_active
            });

            const nav_prefix_klasses = classNames({
                'nav__prefix': true,
                'nav__prefix_secondary': this.props.is_demo,
            })

            return (
                <React.Fragment>
                    <div className="nav">
                        <div className={nav_prefix_klasses}>
                            <div className={menu_btn_klasses} onClick={this.toggleMenu}>Меню</div>
                        </div>
                        <div className="nav__content navslider">
                            {this.renderMain()}
                            {this.renderMenu()}
                        </div>
                    </div>
                    <div className="progressbar">

                    </div>
                </React.Fragment>
            )
        }

        private renderMain() {
            const navbar_slide_main_klasses = classNames({
                'navbar': true,
                'navbar_secondary': this.props.is_demo,
                'navslider__slide': true,
                'navslider__slide_raised': this.state.menu_active
            });

            const navbar_title_klasses = classNames({
                'navbar__title': true,
                'navbar__title_collapsed': this.props.is_demo
            })

            const pager__listwrap_klasses = classNames({
                'pager__listwrap': true,
                'pager__listwrap_secondary': this.props.is_demo
            })

            return (
                <div className={navbar_slide_main_klasses}>
                    <div className="navbar__section">
                        <div className="logo logo_light logo__icon logo__icon_small" />
                    </div>
                    <div className="navbar__section">
                        <h2 className={navbar_title_klasses}>{this.props.lesson_title}</h2>
                        {this.props.is_demo ? <h2 className='navbar__subtitle'>Автономный режим</h2> : null}
                    </div>
                    <div className="navbar__spacer"/>
                    <div className="navbar__section navbar__section_pagerwrap">
                        <div className="pager">
                            <div className="pager__arrow pager__arrow_left"
                                 onClick={() => this.scrollToBegin()}
                            />
                            <div className={pager__listwrap_klasses}>
                                <ul className="pager__list" ref={this.onScrollableUpdate}>
                                    {this.props.missions.map((mission, idx) =>
                                        <MissionLi key={idx}
                                                   id={mission.id}
                                                   index={idx}
                                                   is_current={this.props.progress.mission_idx === idx}
                                                   exercises={mission.exercises}
                                                   title={mission.name}
                                                   description={mission.description}
                                                   progress={this.props.progress.missions[idx]}
                                                   on_click={() => this.chooseMission(idx)}
                                                   on_restart={() => this.restartMission(idx)}
                                                   on_forward={() => this.forwardMission(idx)}
                                                   on_exercise_select={e_idx => this.chooseExercise(idx, e_idx)}
                                                   admin_url_prefix={this.props.admin_url_prefix}
                                        />
                                    )}
                                </ul>
                            </div>
                            <div className="pager__arrow pager__arrow_right" onClick={() => this.scrollToEnd()}/>
                        </div>
                    </div>
                    <div className="navbar__section">
                        <StatusIndicator status={this.props.status} />
                    </div>
                </div>
            )
        }

        private renderMenu() {
            const navbar_slide_menu_klasses = classNames({
                'navbar': true,
                'navbar_inv': true,
                'navslider__slide': true,
                'navslider__slide_raised': this.state.menu_active
            });

            return (
                <div className={navbar_slide_menu_klasses}>
                    <div className="navbar__button" onClick={() => this.chooseMenuItem(MenuItem.Lessons)}>
                        Уроки
                    </div>
                    <div className="navbar__button" onClick={() => this.chooseMenuItem(MenuItem.Settings)}>
                        Настройки
                    </div>
                    {/*<div className="navbar__button" onClick={() => this.chooseMenuItem(MenuItem.Developer)}>*/}
                    {/*    Разработчик*/}
                    {/*</div>*/}
                    {/*<div className="navbar__button" onClick={() => this.chooseMenuItem(MenuItem.Execute)}>*/}
                    {/*    Выполнить*/}
                    {/*</div>*/}
                    <div className="navbar__spacer"/>
                    <div className="navbar__section">
                        <div className='navbar__description'>{document.location.host}</div>
                        <div className='navbar__description navbar__description_small'>{__VERSION__}</div>
                    </div>
                </div>
            )
        }

        private getCurrentScrollPosition() {
            if (!this.el_scrollable) return;

            return this.el_scrollable.scrollLeft;
        }

        private getPreferredScrollPosition() {
            if (!this.el_scrollable) return;

            const index = this.props.progress.mission_idx;

            const el: any = this.el_scrollable.children.item(index);

            return el.offsetLeft - (this.el_scrollable.offsetWidth / 2) + (el.offsetWidth / 2);
        }
    }
}

export default TopbarView;