import Presenter, {on, restore} from "../../core/base/Presenter";
import LaunchView from "../../views/controls/LaunchView";
import CodeModel from "../../models/common/CodeModel";
import ModalModel from "../../core/models/ModalModel";
import BoardModel from "../../models/common/BoardModel";
import LessonModel, {ExerciseType, LaunchMode} from "../../models/lesson/LessonModel";
import ProgressModel, {
    ExercisePassEvent,
    ExerciseRunEvent,
    ExerciseSolutionCommittedEvent,
    ExerciseSolutionValidatedEvent, MissionPassEvent, ValidationVerdictStatus
} from "../../models/lesson/ProgressModel";
import { ColorAccent } from "../../core/helpers/styles";

import i18next from 'i18next';

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

    @on(LaunchView.SkipClickEvent)
    protected onSkipClick(evt: LaunchView.SkipClickEvent) {
        this.progress.passExercise(true);
    }

    @on(LaunchView.CheckClickEvent)
    protected onCheckClick(evt: LaunchView.CheckClickEvent) {
        const [mission_idx, exercise_idx] = this.progress.getOpenedExerciseIndex();
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
                title: i18next.t('main:lesson.modal.validation_request_error.title'),
                content: evt.error,
                status: ColorAccent.Danger,
                timeout: 5000
            });

            return;
        }

        const message = i18next.t(`main:lesson.check.${evt.verdict.code || 'unknown'}`, evt.verdict.message);

        if (evt.verdict.status === ValidationVerdictStatus.Fail) {
            this.modal.showToast({
                title: i18next.t('main:lesson.modal.validation_fail.title'),
                content: message,
                status: ColorAccent.Danger,
                timeout: 5000
            })
        }

        if (evt.verdict.status === ValidationVerdictStatus.Error) {
            this.modal.showToast({
                title: i18next.t('main:lesson.modal.validation_error.title'),
                content: message,
                status: ColorAccent.Warning,
                timeout: 5000
            })
        }

        if (evt.verdict.status === ValidationVerdictStatus.Undefined) {
            this.modal.showToast({
                title: '',
                content: message || i18next.t('main:lesson.modal.validation_undefined.content_default'),
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
                heading: i18next.t("main:lesson.modal.exercise_pass.heading"),
                label_accept: i18next.t("main:lesson.modal.exercise_pass.accept"),
                label_dismiss: i18next.t("main:lesson.modal.exercise_pass.dismiss"),
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
        const go_forward = evt.no_prompt || await this.modal.showQuestionModal({
            dialog: {
                heading: i18next.t('main:lesson.modal.mission_pass.heading'), 
                label_accept: i18next.t('main:lesson.modal.mission_pass.accept'), 
                label_dismiss: i18next.t('main:lesson.modal.mission_pass.dismiss'), 
                is_acceptable: true, 
                is_dismissible: true
            },
            content: i18next.t('main:lesson.modal.mission_pass.content'),
            is_closable: false,
        });

        if (go_forward) {
            const {course_id, lesson_id} = this.progress.getState().opened;
            this.forward('mission', [course_id, lesson_id, evt.mission_idx]);
            this.progress.stepForwardMission();
        }
    }

    protected getLaunchMode() {
        const [mission_idx, exercise_idx] = this.progress.getOpenedExerciseIndex();
        const exercise = this.lesson.getExercise(mission_idx, exercise_idx);

        if (exercise.is_sandbox) {
            switch (exercise.type) {
                case ExerciseType.ProgramAssembly:
                case ExerciseType.Combined:
                case ExerciseType.ButtonPressSeq:
                case ExerciseType.Arduino: {
                    return LaunchView.Mode.SkipAndExecute;
                }
                case ExerciseType.CircuitAssembly:
                case ExerciseType.ElectronicAssembly: {
                    return LaunchView.Mode.SkipOnly; 
                }
                default: {
                    return LaunchView.Mode.SkipOnly; 
                }
            }
        }

        switch (exercise.launch_mode) {
            case LaunchMode.CheckOnly: return LaunchView.Mode.CheckOnly;
            case LaunchMode.ExecuteOnly: return LaunchView.Mode.ExecuteOnly;
            case LaunchMode.CheckAndExecute: return LaunchView.Mode.CheckOrExecute;
        }

        return LaunchView.Mode.None;
    }
}
