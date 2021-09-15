import LayoutRouter from "../core/routers/LayoutRouter";
import {RouteEvent} from "../core/base/Event";

export class LessonRouteEvent extends RouteEvent<LessonRouteEvent> {
    lesson_id: number;
}

export class MissionRouteEvent extends RouteEvent<MissionRouteEvent> {
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
            pathexp: '/app/lessons/{int}', name: 'lesson',
            destination: (lesson_id: number) =>
                this.emit(new LessonRouteEvent({lesson_id}))
        },
        {
            pathexp: '/app/lessons/{int}/missions/{int}', name: 'mission',
            destination: (lesson_id: number, mission_id: number) =>
                this.emit(new MissionRouteEvent({lesson_id, mission_id}))
        }
    ]
}