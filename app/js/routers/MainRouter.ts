import LayoutRouter from "../core/routers/LayoutRouter";
import {route} from "../core/base/Router";
import LessonModel from "../models/LessonModel";
import ProgressModel from "../models/ProgressModel";

export default class MainRouter extends LayoutRouter {
    routes = [
        {pathexp: '/',                  destination: 'index',           name: 'index'},
        {pathexp: '/courses',           destination: 'course_list',     name: 'course-list'},
    ]
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;

    launch() {
        super.launch();

        this.model_lesson = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);
    }

    @route('/lessons/{int}', 'exercise')
    async runExercise(lesson_id: number) {
        console.log('mro', lesson_id)

        const lesson = await this.model_lesson.read({lesson_id});
        this.model_progress.loadLesson(lesson);

        console.log('awa mro', lesson_id)

        const [mission_idx, exercise_idx] = this.model_progress.getExerciseCurrent();
        const exercise = this.model_lesson.getExercise(mission_idx, exercise_idx);

        this.direct(exercise.layout_mode);
    }
}