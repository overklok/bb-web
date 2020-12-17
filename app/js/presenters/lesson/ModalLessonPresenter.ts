import Presenter, {on} from "../../core/base/Presenter";
import ModalView from "../../core/views/modal/ModalView";
import {ExerciseRunEvent} from "../../models/ProgressModel";
import LessonModel from "../../models/LessonModel";

export default  class ModalLessonPresenter extends Presenter<ModalView> {
    private lesson: LessonModel;

    getInitialProps(): any {
        this.lesson = this.getModel(LessonModel);
    }

    @on(ExerciseRunEvent)
    private async showIntroModal(evt: ExerciseRunEvent) {
        const exercise = this.lesson.getExercise(evt.mission_idx, evt.exercise_idx);

        for (const popover of exercise.popovers) {
            const go_forward = await this.showPopoverModal(
                popover.title || `Упражнение ${evt.exercise_idx + 1}`,
                popover.content
            );

            if (!go_forward) break;
        }
    }

    private showPopoverModal(title: string, content: string): Promise<boolean> {
        return new Promise(resolve => {
            this.view.showModal({
                is_closable: false,
                content: content,
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