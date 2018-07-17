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

        this._callbacks = cb;
    }

    inject(dom_node) {
        if (!dom_node) {return false}
        if (this._container) {return true}

        this._container = document.createElement("section");
        this._container.classList.add("courses");

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

        this._container.innerHTML = "";

        let cc = 1, lc = 1;

        let html = `<ul class="courses">`;

        for (let course of courses) {
            html += `<li class="course"><p>Курс ${cc++}</p>
                    <ul class="lessons">`;

            lc = 0;

            for (let lesson of course.lessons) {
                if (lesson.fields.hidden) continue;

                html += `<li class="lesson">
                            <a>
                                <div class="head">Урок ${lc++}</div>
                                <div class="body">${lesson.fields.name}</div>
                            </a>
                        </li>`;
            }

            html += `</ul></li>`;
        }

        html += `</ul>`;

        this._container.innerHTML = html;

        console.log(courses);
    }
}