import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";
import Modal from "../../core/views/modal/Modal";
import Dialog from "../../core/views/modal/Dialog";
import AlertView from "../../core/views/modal/AlertView";
import DialogModal from "../../core/views/modal/DialogModal";
import {CSSTransition, TransitionGroup} from "react-transition-group";

require("../../../css/home.less");
require("../../../css/logo.less");
require("../../../css/core/list.less");
require("../../../css/core/pave.less");

// passed by DefinePlugin in Webpack config
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

    export interface Props extends IViewProps {
        courses: Course[];
        lesson_id: number;
        error?: string;
    }

    export class HomeView extends View<Props, undefined> {
        static defaultProps: Props = {
            courses: [],
            lesson_id: undefined
        }

        constructor(props: AllProps<Props>) {
            super(props);
        }

        handleLessonClick(lesson_id: number) {
            this.emit(new LessonSelectEvent({lesson_id}))
        }

        render(): React.ReactNode {
            const ver = 'v' + __VERSION__.split('/')[1].split('.').slice(0, 3).join('.');

            return (
                <div className="pave">
                    <div className="home-header">
                        <div className="logo logo_centered logo_light logo__full" />
                        <p>Макетная плата</p>
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
                            <h2>Произошла ошибка</h2>
                            <p>{this.props.error}</p>
                            <p>Пробуем загрузиться снова...</p>
                        </DialogModal>
                    </CSSTransition>
                )
            }

            if (this.props.courses.length === 0) {
                return (
                    <CSSTransition key='ldn' in out timeout={200} classNames="mdl" unmountOnExit>
                        <DialogModal size='md' is_centered={true}>
                            <h2>Загрузка...</h2>
                        </DialogModal>
                    </CSSTransition>
                )
            }

            return (
                <CSSTransition key='crs' in out timeout={200} classNames="mdl" unmountOnExit>
                    <Modal size='lg'>
                        <div className="courses">
                            <h1 className="courses__heading">Уроки</h1>

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
                                                        Урок {idx + 1}. {lesson.name}
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