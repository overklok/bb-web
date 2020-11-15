import LayoutRouter from "./core/routers/LayoutRouter";

export default class MainRouter extends LayoutRouter {
    routes = [
        {pathexp: '/',                  destination: 'index',           name: 'index'},
        {pathexp: '/courses',           destination: 'course_list',     name: 'course-list'},
        {pathexp: '/exercises/{int}',   destination: 'exercise',        name: 'exercise'},
    ]
}