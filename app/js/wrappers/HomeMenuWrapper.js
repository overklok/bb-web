import Wrapper from "../core/Wrapper";

import "../../css/courses.css";

export default class HomeMenuWrapper extends Wrapper {
    constructor() {
        super();

        this._container = undefined;
        this._courses_deferred = undefined;

        this._callbacks = {
            lessonclick: () => {}
        }
    }

    onLessonClick(cb) {
        if (!cb) {cb = () => {}}

        this._callbacks.lessonclick = cb;
    }

    inject(dom_node) {
        if (!dom_node) {return false}
        if (this._container) {return true}

        this._container = document.createElement("div");
        this._container.classList.add("home-menu");

        dom_node.appendChild(this._container);

        if (this._courses_deferred) {
            this.displayCourses(this._courses_deferred);
        }
    }

    eject() {
        if (!this._container) {return true}

        this._container.remove();
        this._container = undefined;
    }

    displayCourses(courses) {
        if (!this._container) {
            this._courses_deferred = courses;
            return;
        }

        console.log(courses);

        this._container.innerHTML = "";

        let cc = 1;

        let section_header = document.createElement("section");
        let section_courses = document.createElement("section");
        let ul_courses = document.createElement("ul");

        section_header.classList.add("header");
        section_courses.classList.add("courses");
        ul_courses.classList.add("courses");

        section_header.innerHTML =
            `<img class="logo-main" src="/static/frontend/courses/images/logo.svg" alt="">
            <p>Макетная плата</p>`;

        for (let course of courses) {
            let li_course = document.createElement("li");
            li_course.classList.add("course");
            li_course.innerHTML = `<p>Курс ${cc++}: <span class="course-name">${course.fields.name}</span> </p>`;

            let ul_lessons = document.createElement("ul");
            ul_lessons.classList.add("lessons");

            let lc = 1;

            for (let lesson of course.lessons) {
                if (lesson.fields.hidden) continue;

                let li_lesson = document.createElement("li");
                li_lesson.classList.add("lesson");

                li_lesson.innerHTML =
                    `<a>
                        <div class="head">Урок ${lc++}</div>
                        <div class="body">${lesson.fields.name}</div>
                    </a>`;

                li_lesson.addEventListener("click", (evt) => {
                    this._callbacks.lessonclick(lesson.pk);
                });

                ul_lessons.appendChild(li_lesson);
            }

            li_course.appendChild(ul_lessons);
            ul_courses.appendChild(li_course);
        }

        section_courses.appendChild(ul_courses);
        this._container.appendChild(section_header);
        this._container.appendChild(section_courses);
    }
}