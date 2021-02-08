import RestModel, {CRUDAction, PathParams, RestSchema} from "../core/base/model/RestModel";
import {Query} from "../core/base/model/datasources/HttpDatasource";

type CourseLesson = {
    id: number;
    name: string;
    description: string;
}

export type Course = {
    id: number;
    name: string;
    description: string;
    lessons: CourseLesson[];
}

export default class CourseModel extends RestModel<Course> {
    static alias = 'course';

    protected schema(): RestSchema {
        return {
            [CRUDAction.List]: () => `coursesvc`,
        }
    }

    public async list(params: PathParams = {}, query?: Query): Promise<Course[]> {
        const courses_raw = await super.list(params, query);

        const courses = [];

        for (const course_raw of courses_raw) {
            courses.push(
                CourseModel.processCourse(course_raw)
            );
        }

        return courses;
    }

    static processCourse(_course: any): Course {
        const lessons: CourseLesson[] = [];

        for (const lesson of _course.lessons) {
            lessons.push(
                this.processLesson(lesson)
            );
        }

        return {
            id: _course.pk,
            name: _course.fields.name,
            description: _course.fields.description,
            lessons: lessons
        }
    }

    static processLesson(_lesson: any): CourseLesson {
        return {
            id: _lesson.pk,
            name: _lesson.fields.name,
            description: _lesson.fields.description
        }
    }

    protected defaultState: Course = undefined;
}