import LayoutRouter from "../core/routers/LayoutRouter";
import {route} from "../core/base/Router";
import ExerciseModel from "../models/ExerciseModel";

export default class MainRouter extends LayoutRouter {
    routes = [
        {pathexp: '/',                  destination: 'index',           name: 'index'},
        {pathexp: '/courses',           destination: 'course_list',     name: 'course-list'},
    ]
    private model_exercise: ExerciseModel;

    launch() {
        super.launch();

        this.model_exercise = this.getModel(ExerciseModel);
    }

    @route('/lessons/{int}/exercises/{int}', 'exercise')
    async runExercise(lesson_id: number, exercise_id: number) {
        console.log(lesson_id, exercise_id);
        const exercises = await this.model_exercise.list({l_id: lesson_id});
        console.log(exercises);
    }
}