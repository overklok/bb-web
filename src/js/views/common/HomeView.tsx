import * as React from "react";
import Select from 'react-select';
import i18next from 'i18next';
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {AllProps, IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";
import Modal from "../../core/views/modal/Modal";
import DialogModal from "../../core/views/modal/DialogModal";
import CourseMenu, { Course } from "./home/CourseMenu";

require("~/css/home.less");
require("~/css/logo.less");
require("~/css/core/pave.less");

// provided by DefinePlugin in Webpack config
declare const __VERSION__: string;

namespace HomeView {
    export class LessonSelectEvent extends ViewEvent<LessonSelectEvent> {
        course_id: number;
        lesson_id: number;
    }

    export class LanguageChangeEvent extends ViewEvent<LanguageChangeEvent> {
        lang: string;
    }

    export interface Props extends IViewProps {
        courses: Course[];
        opened: {
            course_id: number;
            lesson_id: number;
        };
        error?: string;
        lang_options: { value: string, label: string }[];
    }

    export class HomeView extends View<Props, undefined> {
        static defaultProps: Props = {
            courses: [],
            opened: {
                course_id: undefined,
                lesson_id: undefined
            },
            lang_options: null,
        }

        constructor(props: AllProps<Props>) {
            super(props);
        }

        handleLessonClick(course_id: number, lesson_id: number) {
            this.emit(new LessonSelectEvent({course_id, lesson_id}));
        }

        render(): React.ReactNode {
            const ver = 'v' + __VERSION__.split('/')[1].split('.').slice(0, 3).join('.');

            const logo_class = i18next.language == 'en' ? 'logo__full_english' : '';

            return (
                <div className="pave">
                    <div className="home-header">
                        <div className={`logo logo_centered logo_light logo__full ${logo_class}`} />
                        <p>{i18next.t('main:home.header.title')}</p>

                        <div className="home-langselect">
                            {this.renderLangOptions(this.props.lang_options)}
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

        private renderLangOptions(options: { value: string, label: string }[]) {
            if (!options || options.length === 0) return null;

            const defaultOption = options.find(item => item.value === this.props.lang);

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
                <Select
                    defaultValue={defaultOption}
                    options={options}
                    theme={theme => ({
                        ...theme,
                        borderRadius: 8,
                    })}
                    onChange={({value}) => this.emit(new LanguageChangeEvent({lang: value}))}
                    styles={styles}
                />
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

            const courses_loc = this.props.courses.filter(course => 
                course.lessons.some(lesson => lesson.language === this.props.lang)
            );

            for (const course of courses_loc) {
                course.lessons = course.lessons.filter(
                    lesson => lesson.language == this.props.lang
                );
            }

            return (
                <CSSTransition key='crs' in out timeout={200} classNames="mdl" unmountOnExit>
                    <Modal size='lg'>
                        <CourseMenu 
                            courses={courses_loc} 
                            opened={this.props.opened}
                            on_lesson_click={(course_id, id) => this.handleLessonClick(course_id, id)} 
                        />
                    </Modal>
                </CSSTransition>
            )
        }
    }
}

export default HomeView;