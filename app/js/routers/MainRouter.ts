import LayoutRouter from "../core/routers/LayoutRouter";
import {route} from "../core/base/Router";
import LessonModel from "../models/LessonModel";

export default class MainRouter extends LayoutRouter {
    routes = [
        {pathexp: '/',                  destination: 'index',           name: 'index'},
        {pathexp: '/courses',           destination: 'course_list',     name: 'course-list'},
    ]
    private model_exercise: LessonModel;

    launch() {
        super.launch();

        this.model_exercise = this.getModel(LessonModel);
    }

    @route('/lessons/{int}/exercises/{int}', 'exercise')
    async runExercise(lesson_id: number, exercise_id: number) {
        const exercise = await this.model_exercise.read({lesson_id, exercise_id});
        this.direct(exercise.layout_mode);
    }
}