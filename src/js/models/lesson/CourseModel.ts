import CRUDHttpModel, {CRUDAction, PathParams, CRUDSchema} from "../../core/models/CRUDHttpModel";
import {Query} from "~/js/core/models/datasources/HttpDatasource";

type CourseLesson = {
    id: number;
    name: string;
    description: string;
    language: string;
}

export type Course = {
    id: number;
    name: string;
    description: string;
    lessons: CourseLesson[];
}

export default class CourseModel extends CRUDHttpModel<Course> {
    static alias = 'course';

    protected schema(): CRUDSchema {
        return {
            [CRUDAction.List]: () => `courses`,
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
            description: _lesson.fields.description,
            language: _lesson.fields.language
        }
    }

    protected defaultState: Course = undefined;
}