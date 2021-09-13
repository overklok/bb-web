import {on, restore} from "../../core/base/Presenter";
import ProgressModel, {ExerciseRunEvent} from "../../models/lesson/ProgressModel";
import LessonModel from "../../models/lesson/LessonModel";
import ModalPresenter from "../../core/presenters/ModalPresenter";

import i18next from 'i18next';

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
                popover.title || i18next.t('main:lesson.modal.popover.title', {num: exercise_idx + 1}),
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
                    label_accept: i18next.t('main:lesson.modal.popover.accept'),
                    is_acceptable: true,
                    on_action: () => {resolve(true)},
                },
            }, 'popover');
        });
    }

    protected updateModals() {
        return;
    }
}