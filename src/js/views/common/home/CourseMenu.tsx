import * as React from "react";
import classNames from "classnames";
import i18next from 'i18next';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { endsWith } from "lodash";

require("~/css/core/gridmenu.less");
require("~/css/core/list.less");

export interface CourseMenuProps {
    courses: Course[];
    lesson_id?: number;
    on_lesson_click: (lesson_id: number) => void;
}

export default function CourseMenu(props: CourseMenuProps) {
    let course_idx = props.courses.findIndex(
        (v, i) => v.lessons.map(l => l.id).indexOf(props.lesson_id) > -1
    );

    const [idx_expanded, setExpanded] = React.useState(course_idx);

    // current = props.courses[idx].lessons.map(l => l.id).indexOf(props.lesson_id) > -1;


    const expand = (idx: number) => {
        if (idx_expanded === idx) {
            setExpanded(-1);
        } else {
            setExpanded(idx); 
        }
    }

    const klasses_courses = classNames({
        "courses": true,
        "courses_simplified": idx_expanded !== -1
    });

    const klasses_gridmenu = classNames({
        "gridmenu": true,
        "gridmenu_expanded": idx_expanded !== -1
    })

    return (
        <div className={klasses_courses}>
            <div className="courses__head">
                {i18next.t("main:home.courses.courses")}
            </div>

            <div className="courses__body">
                <ul className={klasses_gridmenu}>
                    {props.courses.map((course: Course, idx: number) =>
                        <CourseMenuItem 
                            lesson_id={props.lesson_id}
                            heading={course.name} 
                            lessons={course.lessons} 
                            is_expanded={idx === idx_expanded}
                            is_hidden={idx !== idx_expanded && idx_expanded !== -1}
                            is_nonclosable={props.courses.length === 1}
                            on_click={() => expand(idx)}
                            on_lesson_click={id => props.on_lesson_click(id)}
                            key={idx}
                        />
                    )}
                </ul>
            </div>
        </div>
    )
}

interface Lesson {
    id: number;
    name: string;
    language: string;
}

interface Course {
    id: number;
    name: string;
    lessons: Lesson[];
}

interface CourseMenuItemProps {
    heading: string;
    lessons: Lesson[];
    is_expanded?: boolean;
    is_hidden?: boolean;
    is_nonclosable?: boolean;
    on_click?: () => void;
    on_lesson_click: (lesson_id: number) => void;
    lesson_id: number;
}

function CourseMenuItem(props: CourseMenuItemProps) {
    const lesson_cur = props.lessons.find(l => l.id === props.lesson_id);

    const body = props.is_expanded ? 
    (
        <ExerciseList 
            lessons={props.lessons} 
            lesson_id={props.lesson_id} 
            on_click={(lesson_id) => props.on_lesson_click(lesson_id)}
            />
    ) : (
        <div>
            <div>{props.lessons.length} lessons</div>
            <div>
                {lesson_cur ? `Currently passing "${lesson_cur.name}"` : ''}
            </div>
        </div>
    );

    const klasses = classNames({
        "gridmenu__item": true,
        "gridmenu__item_hidden": props.is_hidden
    });

    const klasses_course = classNames({
        "gm-course": true,
        "gm-course_expanded": props.is_expanded
    });

    const klasses_course_head = classNames({
        "gm-course__head": true,
        "gmc-nav": true,
        "gmc-nav_expanded": props.is_expanded
    });

    const gmc_nav_back = props.is_nonclosable ? null : (
            <div className="gmc-nav__back">
                {'< Back'}
            </div>
        );

    const mark_current = lesson_cur ? 
            <span className="mark mark_warning" /> :
            <span className="mark" />;

    return (
        <li className={klasses}>
            <div className={klasses_course}>
                <div className={klasses_course_head} onClick={() => props.on_click()}>
                    <div className="gmc-nav__heading">
                        {mark_current}
                        {props.heading} 
                    </div>

                    {gmc_nav_back}

                </div>
                <div className="gm-course__body" onClick={() => !props.is_expanded && props.on_click()}>
                    {body}
                </div>
            </div>
        </li>
    )
}

interface ExerciseListProps {
    lessons: Lesson[];
    lesson_id: number;
    on_click: (lesson_id: number) => void;
}

function ExerciseList(props: ExerciseListProps) {
    return (
        <ul className="list">
            <TransitionGroup component={null}>
                {props.lessons.map((lesson, idx) => (
                    <CSSTransition key={idx} in appear timeout={0} classNames="list__item">
                        <li className="list__item list__item_clickable"
                            onClick={() => props.on_click(lesson.id)}
                            key={lesson.id}
                            style={{transitionDelay: `${idx * 50}ms`}}
                        >
                            {
                                props.lesson_id === lesson.id ?
                                    <span className="mark mark_warning" /> :
                                    <span className="mark" />
                            }

                            <span>
                                {lesson.name}
                            </span>

                            <span style={{float: "right", lineHeight: "1.5em", marginRight: 10}}>
                                {/* {lesson.language == 'en' ? '🇺🇸' : '🇷🇺'} */}
                                {/* 0 <i className="fa fa-tasks" /> */}
                            </span>
                        </li>
                    </CSSTransition>
                ))} 
            </TransitionGroup>
        </ul>
    );
}