import {on, restore} from "../../core/base/Presenter";
import ProgressModel, {ExerciseRunEvent} from "../../models/ProgressModel";
import LessonModel from "../../models/lesson/LessonModel";
import ModalPresenter from "../../core/presenters/ModalPresenter";

export default class PopoverLessonPresenter extends ModalPresenter {
    private lesson: LessonModel;
    private progress: ProgressModel;

    getInitialProps(): any {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);

        return super.getInitialProps();
    }

    @restore() @on(ExerciseRunEvent)
    private async showIntroModal() {
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
            this.pushModal({
                is_closable: true,
                widget_alias: 'popover_content',
                dialog: {
                    heading: title,
                    label_accept: 'Продолжить',
                    on_accept: () => {
                        resolve(true);
                    },
                },
            }, 'popover');
        });
    }

    protected updateModals() {
        return;
    }
}