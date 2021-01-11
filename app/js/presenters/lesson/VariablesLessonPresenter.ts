import Presenter, {on, restore} from "../../core/base/Presenter";
import LessonModel from "../../models/lesson/LessonModel";
import ProgressModel, {ExerciseRunEvent} from "../../models/ProgressModel";
import ModalView from "../../core/views/modal/ModalView";
import CodeModel from "../../models/common/CodeModel";

export default class VariablesLessonPresenter extends Presenter<ModalView> {
    private code: CodeModel;
    private lesson: LessonModel;
    private progress: ProgressModel;

    getInitialProps(): any {
        this.code = this.getModel(CodeModel);
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);

        const [mission_idx, exercise_idx] = this.progress.getExerciseCurrent();

        return {
            variables: this.getVariableValues(mission_idx, exercise_idx)
        }
    }

    @restore() @on(ExerciseRunEvent)
    private async showVariableValues(evt: ExerciseRunEvent) {
        this.setViewProps({
            variables: this.getVariableValues(evt.mission_idx, evt.exercise_idx)
        });
    }

    private getVariableValues(mission_idx: number, exercise_idx: number) {
        const exercise = this.lesson.getExercise(mission_idx, exercise_idx);
        const variables = this.code.getState().variables;

        return exercise.module_settings.code.variables.map(variable => {return {
            name: variable.name,
            type: variable.type,
            value: variables[variable.name] != null ? variables[variable.name] : variable.initial_value
        }});
    }
}