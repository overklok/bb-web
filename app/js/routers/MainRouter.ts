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
        {
            pathexp: '/', name: 'index',
            destination: 'index'
        },
        {
            pathexp: '/courses', name: 'course-list',
            destination: 'course_list'
        },
        {
            pathexp: '/lessons/{int}', name: 'lesson',
            destination: (lesson_id: number) =>
                this.emit(new LessonRouteEvent({lesson_id}))
        },
        {
            pathexp: '/lessons/{int}/missions/{int}', name: 'mission',
            destination: (lesson_id: number, mission_id: number) =>
                this.emit(new MissionRouteEvent({lesson_id, mission_id}))
        }
    ]
}