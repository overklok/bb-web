import * as React from "react";
import {AllProps, IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require("../../../css/courses.less");

interface Lesson {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    lessons: Lesson[];
}

export namespace LessonMenuView {
    export class LessonSelectEvent extends ViewEvent<LessonSelectEvent> {
        lesson_id: number;
    }

    export interface Props extends IViewProps {
        courses: Course[];
    }

    export class LessonMenuView extends View<Props, undefined> {
        static defaultProps: Props = {
            courses: []
        }

        constructor(props: AllProps<Props>) {
            super(props);
        }

        handleLessonClick(lesson_id: number) {
            this.emit(new LessonSelectEvent({lesson_id}))
        }

        render(): React.ReactNode {
            return (
                <div>
                    <section className="header">
                        <img className="logo-main" src="/static/frontend/courses/images/logo.svg" alt="" />
                        <p>Макетная плата</p>
                    </section>
                    <section className="courses">
                        <ul className="courses">
                            {this.props.courses.map((course, idx) =>
                            <li className="course" key={idx}>
                                <p>
                                    Курс {idx+1}:&nbsp;
                                    <span className="course-name">{course.name}</span>
                                </p>

                                <ul className="lessons">
                                    {course.lessons.map((lesson, idx) =>
                                        <li className="lesson" key={idx}>
                                            <a role="button" onClick={() => this.handleLessonClick(lesson.id)}>
                                                <div className="head">Урок {idx+1}</div>
                                                <div className="body">{lesson.name}</div>
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </li>
                            )}
                        </ul>
                    </section>
                </div>
            )
        }
    }
}