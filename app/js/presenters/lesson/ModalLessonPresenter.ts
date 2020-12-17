import Presenter, {on, restore} from "../../core/base/Presenter";
import ModalView from "../../core/views/modal/ModalView";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";
import LessonModel from "../../models/LessonModel";

export default class ModalLessonPresenter extends Presenter<ModalView> {
    private lesson: LessonModel;
    private progress: ProgressModel;

    getInitialProps(): any {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);
    }

    @restore() @on(ExerciseRunEvent)
    private async showIntroModal(evt: ExerciseRunEvent) {
        console.log(evt);

        const [mission_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(mission_idx, exercise_idx);

        for (const [i, popover] of exercise.popovers.entries()) {
            const go_forward = await this.showPopoverModal(
                popover.title || `Упражнение ${exercise_idx + 1}`,
                popover.content
            );

            if (!go_forward) break;
        }
    }

    private showPopoverModal(title: string, content: string): Promise<boolean> {
        this.lesson.setPopoverContent(content);

        return new Promise(resolve => {
            this.view.showModal({
                is_closable: false,
                widget_alias: 'popover_content',
                dialog: {
                    heading: title,
                    label_accept: 'Продолжить',
                    on_accept: () => {
                        resolve(true);
                    },
                },
            });
        });
    }
}