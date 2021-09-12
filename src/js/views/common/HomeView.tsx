import * as React from "react";
import Select from 'react-select';
import i18next from 'i18next';

import {AllProps, IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";
import Modal from "../../core/views/modal/Modal";
import DialogModal from "../../core/views/modal/DialogModal";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import { BooleanLiteral } from "typescript";

require("~/css/home.less");
require("~/css/logo.less");
require("~/css/core/list.less");
require("~/css/core/pave.less");

// provided by DefinePlugin in Webpack config
declare const __VERSION__: string;

interface Lesson {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    lessons: Lesson[];
}

namespace HomeView {
    export class LessonSelectEvent extends ViewEvent<LessonSelectEvent> {
        lesson_id: number;
    }

    export class LanguageChangeEvent extends ViewEvent<LanguageChangeEvent> {
        lang: string;
    }

    export interface Props extends IViewProps {
        courses: Course[];
        lesson_id: number;
        error?: string;
        lang_redirect?: boolean;
    }

    export class HomeView extends View<Props, undefined> {
        static defaultProps: Props = {
            courses: [],
            lesson_id: undefined,
            lang_redirect: true,
        }

        constructor(props: AllProps<Props>) {
            super(props);

            this.redirect = this.redirect.bind(this);
        }

        handleLessonClick(lesson_id: number) {
            this.emit(new LessonSelectEvent({lesson_id}))
        }

        redirect({ value: lang, label }: { value: string, label: string }) {
            // if (this.props.lang_redirect) {
            //     const params = new URLSearchParams(window.location.search)
            //     params.set('lang', lang);

            //     window.location.search = params.toString();
            // } else {
                this.emit(new LanguageChangeEvent({lang}))
            // }
        }

        render(): React.ReactNode {
            const ver = 'v' + __VERSION__.split('/')[1].split('.').slice(0, 3).join('.');

            const options = [
                { value: 'en', label: '🇺🇸 English' },
                { value: 'ru', label: '🇷🇺 Русский' },
            ];

            const defaultOption = options.find(item => item.value === i18next.language);

            const styles = {
                dropdownIndicator: (styles: any) => {
                    return { ...styles, cursor: 'pointer'} 
                },
                option: (styles: any) => {
                    return { ...styles, fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }
                },
                singleValue: (styles: any) => {
                    return { ...styles, fontWeight: 'bold', cursor: 'pointer' }
                }
            }

            return (
                <div className="pave">
                    <div className="home-header">
                        <div className="logo logo_centered logo_light logo__full" />
                        <p>{i18next.t('main:home.header.title')}</p>

                        <div className="home-langselect">
                            <Select
                                defaultValue={defaultOption}
                                options={options}
                                theme={theme => ({
                                    ...theme,
                                    borderRadius: 8,
                                })}
                                onChange={this.redirect}
                                styles={styles}
                            />
                        </div>
                    </div>
                    <div className="app-screen">
                        <TransitionGroup component={null}>
                            {this.renderCourses()}
                        </TransitionGroup>
                    </div>

                    <div className="home-version">
                        {ver}
                    </div>
                </div>
            )
        }

        private renderCourses() {
            if (this.props.error) {
                return (
                    <CSSTransition key='err' in out timeout={200} classNames="mdl" unmountOnExit>
                        <DialogModal size='md' is_centered={true}>
                            <h2>{i18next.t("main:home.courses.error")}</h2>
                            <p>{this.props.error}</p>
                            <p>{i18next.t("main:home.courses.reloading")}</p>
                        </DialogModal>
                    </CSSTransition>
                )
            }

            if (this.props.courses.length === 0) {
                return (
                    <CSSTransition key='ldn' in out timeout={200} classNames="mdl" unmountOnExit>
                        <DialogModal size='md' is_centered={true}>
                            <p>{i18next.t("main:home.courses.loading")}</p>
                        </DialogModal>
                    </CSSTransition>
                )
            }

            return (
                <CSSTransition key='crs' in out timeout={200} classNames="mdl" unmountOnExit>
                    <Modal size='lg'>
                        <div className="courses">
                            <h1 className="courses__heading">{i18next.t("main:home.courses.lessons")}</h1>

                            <ul className="list">
                                {this.props.courses.map((course, idx) =>
                                    <React.Fragment key={idx}>
                                        <li className="list__delimiter" key={idx}>
                                            {course.name}
                                        </li>

                                        {course.lessons.map((lesson, idx) =>
                                            <React.Fragment key={idx}>
                                                <li className="list__item list__item_clickable"
                                                    onClick={() => this.handleLessonClick(lesson.id)}
                                                >
                                                    {
                                                        this.props.lesson_id === lesson.id ?
                                                            <span className="mark mark_warning" /> :
                                                            <span className="mark" />
                                                    }

                                                    <span>
                                                        {i18next.t("main:home.courses.lesson")} {idx + 1}. {lesson.name}
                                                    </span>

                                                    <span style={{float: "right", lineHeight: "1.5em", marginRight: 10}}>
                                                        0 <i className="fa fa-tasks" />
                                                    </span>
                                                </li>
                                            </React.Fragment>
                                        )}
                                    </React.Fragment>
                                )}
                            </ul>
                        </div>
                    </Modal>
                </CSSTransition>
            )
        }
    }
}

export default HomeView;