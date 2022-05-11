import LayoutRouter from "../core/routers/LayoutRouter";
import {RouteEvent} from "../core/base/Event";

export class CourseRouteEvent extends RouteEvent<CourseRouteEvent> {
    course_id: number;
}

export class LessonRouteEvent extends RouteEvent<LessonRouteEvent> {
    course_id: number;
    lesson_id: number;
}

export class MissionRouteEvent extends RouteEvent<MissionRouteEvent> {
    course_id: number;
    lesson_id: number;
    mission_id: number;
}

export default class MainRouter extends LayoutRouter {
    routes = [
        // Handles root URL [for webpack-dev-server]
        {
            pathexp: '/', name: 'falseindex',
            destination: () => this.redirect(this.reverse('index'))
        },
        {
            pathexp: '/app', name: 'index',
            destination: 'index'
        },
        {
            pathexp: '/app/courses', name: 'course-list',
            destination: 'course_list'
        },
        {
            pathexp: '/app/courses/{int}', name: 'course',
            destination: (course_id: number) =>
                this.emit(new CourseRouteEvent({course_id}))
        },
        {
            pathexp: '/app/courses/{int}/lesson/{int}', name: 'lesson',
            destination: (course_id: number, lesson_id: number) =>
                this.emit(new LessonRouteEvent({course_id, lesson_id}))
        },
        {
            pathexp: '/app/courses/{int}/lessons/{int}/missions/{int}', name: 'mission',
            destination: (course_id: number, lesson_id: number, mission_id: number) =>
                this.emit(new MissionRouteEvent({course_id, lesson_id, mission_id}))
        }
    ]
}