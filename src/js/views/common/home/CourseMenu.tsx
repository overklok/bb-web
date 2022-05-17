import * as React from "react";
import classNames from "classnames";
import i18next from 'i18next';
import { CSSTransition, TransitionGroup } from "react-transition-group";

require("~/css/core/gridmenu.less");
require("~/css/core/list.less");

export interface LessonStats {
    exercises: { total: number; passed: number; };
    missions:  { total: number; passed: number; }
}

export interface Lesson {
    id: number;
    name: string;
    language: string;
    stats: LessonStats;
}

export interface Course {
    id: number;
    name: string;
    lessons: Lesson[];
}

export interface CourseMenuProps {
    courses: Course[];
    opened: {
        course_id: number;
        lesson_id: number;
    };
    on_lesson_click: (course_id: number, lesson_id: number) => void;
}

export default function CourseMenu(props: CourseMenuProps) {
    const [id_expanded, setExpanded] = React.useState(props.opened.course_id);

    const expand = (id: number) => {
        if (id_expanded === id) {
            setExpanded(undefined);
        } else {
            setExpanded(id); 
        }
    }

    const klasses_courses = classNames({
        "courses": true,
        "courses_simplified": id_expanded !== undefined
    });

    const klasses_gridmenu = classNames({
        "gridmenu": true,
        "gridmenu_expanded": id_expanded !== undefined
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
                            opened={props.opened}
                            heading={course.name} 
                            lessons={course.lessons} 
                            is_hidden={course.id !== id_expanded && id_expanded !== undefined}
                            is_expanded={course.id === id_expanded}
                            is_nonclosable={props.courses.length === 1}
                            on_click={() => expand(course.id)}
                            on_lesson_click={id => props.on_lesson_click(course.id, id)}
                            key={idx}
                        />
                    )}
                </ul>
            </div>
        </div>
    )
}

interface CourseMenuItemProps {
    heading: string;
    lessons: Lesson[];
    opened: {
        course_id: number;
        lesson_id: number;
    };
    is_hidden?: boolean;
    is_expanded?: boolean;
    is_nonclosable?: boolean;
    on_click?: () => void;
    on_lesson_click: (lesson_id: number) => void;
}

/**
 * An item for course menu
 * 
 * Contains general course info and list of containing lessons.
 * 
 * Has two states:
 *  - Collapsed (as an item of course menu list)
 *  - Expanded (as a content for course menu, fills the container)
 */
function CourseMenuItem(props: CourseMenuItemProps) {
    const {passed: lessons_passed,   total: lessons_total}   = getLessonsStats(props.lessons),
          {passed: exercises_passed, total: exercises_total} = getLessonExercisesStats(props.lessons);

    const body = props.is_expanded ? 
    (
        <LessonList 
            lessons={props.lessons} 
            on_click={(lesson_id) => props.on_lesson_click(lesson_id)}
        />
    ) : (
        <div>
            <div>{props.lessons.length} lessons</div>
            {
                lessons_total ? 
                <div>{lessons_passed} of {lessons_total} passed</div> : null
            }
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

    const mark_current = exercises_passed ? 
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

interface LessonListProps {
    lessons: Lesson[];
    on_click: (lesson_id: number) => void;
}

/**
 * Lesson list UI
 * 
 * Each item is a control element that allows to switch lessons.
 * Each item can be in one of the following states:
 *  - Default (0 missions passed)
 *  - Currently passing (less than total missions passed)
 *  - Completed (all missions passed)
 * 
 * @param props 
 */
function LessonList(props: LessonListProps) {
    return (
        <ul className="list">
            <TransitionGroup component={null}>
                {props.lessons.map((lesson, idx) => {
                    const klasses_mark = classNames({
                        "mark": true,
                        "mark_warning": lesson.stats.exercises.total && lesson.stats.exercises.total !== lesson.stats.exercises.passed,
                        "mark_success": lesson.stats.exercises.total && lesson.stats.exercises.total === lesson.stats.exercises.passed
                    });

                    return (
                        <CSSTransition key={idx} in appear timeout={0} classNames="list__item">
                            <li className="list__item list__item_clickable"
                                onClick={() => props.on_click(lesson.id)}
                                key={lesson.id}
                                style={{transitionDelay: `${idx * 50}ms`}}
                            >
                                <span className={klasses_mark} />
                                <span>
                                    {lesson.name}
                                </span>

                                <span style={{float: "right", lineHeight: "1.5em", marginRight: 10}}>
                                    {lesson.stats.exercises.total ? `${Math.round(lesson.stats.exercises.passed / lesson.stats.exercises.total * 100)}%` : '-'}
                                    &nbsp;
                                    {/* {lesson.stats.exercises_total ? <i className="fa fa-tasks" /> : null} */}
                                    {/* {lesson.language == 'en' ? '🇺🇸' : '🇷🇺'} */}
                                    
                                </span>
                            </li>
                        </CSSTransition>
                    )}
                )} 
            </TransitionGroup>
        </ul>
    );
}

function getLessonExercisesStats(lessons: Lesson[]) {
    return {
        passed: lessons.reduce((sum, l) => sum + l.stats.exercises.passed, 0),
        total:  lessons.reduce((sum, l) => sum + l.stats.exercises.total, 0)
    }
}

function getLessonMissionsStats(lessons: Lesson[]) {
    return {
        passed: lessons.reduce((sum, l) => sum + l.stats.missions.passed, 0),
        total:  lessons.reduce((sum, l) => sum + l.stats.missions.total, 0),
    }
}

function getLessonsStats(lessons: Lesson[]) {
    return {
        passed: lessons.reduce(
            (sum, l) => sum + l.stats.missions.total && 
                        Number(l.stats.missions.passed === l.stats.missions.total), 
            0
        ),
        total: lessons.length
    }
}