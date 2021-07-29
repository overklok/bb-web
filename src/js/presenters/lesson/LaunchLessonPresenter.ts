import Presenter, {on, restore} from "../../core/base/Presenter";
import LaunchView from "../../views/controls/LaunchView";
import CodeModel from "../../models/common/CodeModel";
import ModalModel from "../../core/models/ModalModel";
import BoardModel from "../../models/common/BoardModel";
import LessonModel, {LaunchMode} from "../../models/lesson/LessonModel";
import ProgressModel, {
    ExercisePassEvent,
    ExerciseRunEvent,
    ExerciseSolutionCommittedEvent,
    ExerciseSolutionValidatedEvent, MissionPassEvent, ValidationVerdictStatus
} from "../../models/lesson/ProgressModel";
import { RequestErrorEvent } from "../../core/base/model/HttpModel";
import { ColorAccent } from "../../core/helpers/styles";

export default class LaunchLessonPresenter extends Presenter<LaunchView.LaunchView> {
    private code: CodeModel;
    private modal: ModalModel;
    private board: BoardModel;
    private lesson: LessonModel;
    private progress: ProgressModel;

    public getInitialProps() {
        this.code = this.getModel(CodeModel);
        this.board = this.getModel(BoardModel);
        this.modal = this.getModel(ModalModel);
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);

        return {mode: this.getLaunchMode()};
    }

    @restore() @on(ExerciseRunEvent)
    private onExerciseLoaded() {
        this.setViewProps({mode: this.getLaunchMode()});
    }

    @on(LaunchView.CheckClickEvent)
    protected onCheckClick(evt: LaunchView.CheckClickEvent) {
        const [mission_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(mission_idx, exercise_idx);

        if (evt.start) {
            // run checks
            this.progress.validateExerciseSolution(exercise.id, {
                code: this.code.getState().chainset,
                board: this.board.getState().plates,
                board_info: this.board.getCurrentBoardInfo(true),
                board_layout_name: this.board.getBoardLayout()
            });
        }
    }

    @on(ExerciseSolutionCommittedEvent)
    protected onValidationStart() {
        this.setViewProps({is_checking: LaunchView.ButtonState.Busy});
    }

    @on(ExerciseSolutionValidatedEvent)
    protected onValidationFinish(evt: ExerciseSolutionValidatedEvent) {
        this.setViewProps({is_checking: LaunchView.ButtonState.Idle});

        if (evt.error) {
            this.modal.showToast({
                title: 'Ошибка отправки запроса',
                content: evt.error,
                status: ColorAccent.Danger,
                timeout: 5000
            });

            return;
        }

        if (evt.verdict.status === ValidationVerdictStatus.Fail) {
            this.modal.showToast({
                title: 'Упражнение не выполнено',
                content: evt.verdict.message,
                status: ColorAccent.Danger,
                timeout: 5000
            })
        }

        if (evt.verdict.status === ValidationVerdictStatus.Error) {
            this.modal.showToast({
                title: 'Ошибка проверки задания',
                content: evt.verdict.message,
                status: ColorAccent.Warning,
                timeout: 5000
            })
        }

        if (evt.verdict.status === ValidationVerdictStatus.Undefined) {
            this.modal.showToast({
                title: 'Упражнение не может быть проверено',
                content: evt.verdict.message || 'Неизвестная ошибка',
                status: ColorAccent.Warning,
                timeout: 5000
            })
        }

        if (evt.verdict.status === ValidationVerdictStatus.Success) {
            this.progress.passExercise();
        }
    }

    @on(ExercisePassEvent)
    protected async onExercisePass() {
        const go_forward = await this.modal.showQuestionModal({
            dialog: {
                heading: 'Упражнение пройдено!',
                label_accept: 'Продолжить',
                label_dismiss: 'Остаться',
                is_acceptable: true,
                is_dismissible: true
            },
            is_closable: false,
        });

        if (go_forward) {
            this.progress.stepForwardMission();
        }
    }

    @on(MissionPassEvent)
    protected async onMissionPass(evt: MissionPassEvent) {
        const go_forward = await this.modal.showQuestionModal({
            dialog: {heading: 'Задание пройдено', label_accept: 'Продолжить', label_dismiss: 'Остаться', is_acceptable: true, is_dismissible: true},
            content: 'Остаться и попробовать ещё, или перейти к следующему заданию?',
            is_closable: false,
        });

        if (go_forward) {
            const lesson_id = this.progress.getState().lesson_id;
            this.forward('mission', [lesson_id, evt.mission_idx]);
            this.progress.stepForwardMission();
        }
    }

    protected getLaunchMode() {
        const [mission_idx, exercise_idx] = this.progress.getExerciseCurrent();
        const exercise = this.lesson.getExercise(mission_idx, exercise_idx);

        if (exercise.is_sandbox) {
            // return LaunchView.Mode.ExecuteOnly;
        }

        switch (exercise.launch_mode) {
            case LaunchMode.CheckOnly: return LaunchView.Mode.CheckOnly;
            case LaunchMode.ExecuteOnly: return LaunchView.Mode.ExecuteOnly;
            case LaunchMode.CheckAndExecute: return LaunchView.Mode.CheckOrExecute;
        }

        return LaunchView.Mode.None;
    }
}