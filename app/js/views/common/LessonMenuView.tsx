import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require("../../../css/courses.less");
require("../../../css/logo.less");

interface Lesson {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    lessons: Lesson[];
}

namespace LessonMenuView {
    export class LessonSelectEvent extends ViewEvent<LessonSelectEvent> {
        lesson_id: number;
    }

    export interface Props extends IViewProps {
        courses: Course[];
        lesson_id: number;
        error?: string;
    }

    export class LessonMenuView extends View<Props, undefined> {
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
            console.log('r', this.props);

            return (
                <React.Fragment>
                    <section className="header">
                        <div className="logo logo_centered logo_light logo__full" />
                        <p>Макетная плата</p>
                    </section>
                    <section className="courses">
                        {this.renderCourses()}
                    </section>
                </React.Fragment>
            )
        }

        private renderCourses() {
            console.log('rc', this.props.error);

            if (this.props.error) {
                return <div>{`Error: ${this.props.error}`}</div>;
            }

            if (this.props.courses.length === 0) {
                return <div>Loading...</div>;
            }

            return (
                <ul className="courses">
                    {this.props.courses.map((course, idx) =>
                        <li className="course" key={idx}>
                            <p>
                                Курс {idx + 1}:&nbsp;
                                <span className="course-name">{course.name}</span>
                            </p>

                            <ul className="lessons">
                                {course.lessons.map((lesson, idx) =>
                                    <li className="lesson" key={idx}>
                                        <a role="button" onClick={() => this.handleLessonClick(lesson.id)}>
                                            <div className="head">
                                                Урок {idx + 1}
                                            </div>
                                            <div className="body">
                                                {lesson.name}
                                                <br/>
                                                <small>
                                                    <i>
                                                        {this.props.lesson_id === lesson.id ? 'Продолжить' : ''}
                                                    </i>
                                                </small>
                                            </div>
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </li>
                    )}
                </ul>
            )
        }
    }
}

export default LessonMenuView;