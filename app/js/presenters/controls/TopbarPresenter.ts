import Presenter, {on, restore} from "../../core/base/Presenter";

import ModalModel from "../../core/models/ModalModel";
import LessonModel from "../../models/lesson/LessonModel";
import SettingsModel, {SettingsChangedEvent} from "../../core/models/SettingsModel";
import ProgressModel, {ExercisePassEvent, ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";
import {BoardStatusEvent} from "../../models/common/BoardModel";
import {ConnectionStatusEvent} from "../../models/common/ConnectionModel";
import {ConnectionStatus} from "../../views/controls/topbar/StatusIndicator";
import TopbarView, {MenuItem} from "../../views/controls/TopbarView";

export default class TopbarPresenter extends Presenter<TopbarView.TopbarView> {
    private model_lesson: LessonModel;
    private model_progress: ProgressModel;
    private model_settings: SettingsModel;
    private model_modal: ModalModel;

    public getInitialProps(): TopbarView.Props {
        this.model_lesson   = this.getModel(LessonModel);
        this.model_progress = this.getModel(ProgressModel);
        this.model_settings = this.getModel(SettingsModel);
        this.model_modal    = this.getModel(ModalModel);

        const lesson = this.model_lesson.getState();

        return {
            lesson_title: lesson.name,
            missions: lesson.missions,
            progress: this.model_progress.getState(),
            status: ConnectionStatus.Unknown,
            is_demo: this.model_settings.getValue('general.is_demo') as boolean,
            admin_url_prefix: this.model_lesson.host_name
        }
    }

    @restore() @on(ConnectionStatusEvent)
    private showCoreConnection(evt: ConnectionStatusEvent) {
        switch (evt.status) {
            case "disconnected":    this.setViewProps({status: ConnectionStatus.Disconnected}); break;
            case "timeout":         this.setViewProps({status: ConnectionStatus.Disconnected}); break;
            case "waiting":         this.setViewProps({status: ConnectionStatus.Waiting}); break;
        }
    }

    @restore() @on(BoardStatusEvent)
    private showBoardConnection(evt: BoardStatusEvent) {
        switch (evt.status) {
            case "disconnected":    this.setViewProps({status: ConnectionStatus.BoardDisconnected}); break;
            case "connected":       this.setViewProps({status: ConnectionStatus.BoardConnected}); break;
            case "searching":       this.setViewProps({status: ConnectionStatus.BoardSearching}); break;
        }
    }

    @restore() @on(LessonRunEvent)
    private updateLessonData() {
        const lesson = this.model_lesson.getState();

        this.setViewProps({
            lesson_title: lesson.name,
            missions: lesson.missions,
            progress: this.model_progress.getState()
        });
    }

    @on(ExerciseRunEvent, ExercisePassEvent)
    private updateProgress(evt: ExerciseRunEvent) {
        this.setViewProps({
            progress: this.model_progress.getState()
        });
    }

    @on(TopbarView.MissionForwardEvent)
    private async forwardMission(evt: TopbarView.MissionForwardEvent) {
        this.model_progress.fastForwardMission();

        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.MissionRestartEvent)
    private async restartMission(evt: TopbarView.MissionRestartEvent) {
        this.model_progress.restartMission();

        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.MissionSelectEvent)
    private async selectMission(evt: TopbarView.MissionSelectEvent) {
        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.ExerciseSelectEvent)
    private async selectExercise(evt: TopbarView.ExerciseSelectEvent) {
        this.model_progress.switchExercise(evt.mission_idx, evt.exercise_idx);

        const lesson_id = this.model_progress.getState().lesson_id;
        await this.forward('mission', [lesson_id, evt.mission_idx]);
    }

    @on(TopbarView.MenuItemEvent)
    private openLessonMenu(evt: TopbarView.MenuItemEvent) {
        switch (evt.item) {
            case MenuItem.Lessons: this.forward('index', []); break;
            case MenuItem.Settings: this.showSettingsModal(); break;
        }
    }

    @on(SettingsChangedEvent)
    private updateSettingsChange() {
        this.setViewProps({
            is_demo: this.model_settings.getValue('general.is_demo') as boolean,
        });
    }

    private showSettingsModal() {
        this.model_modal.showModal({
            widget_alias: 'settings',
            size: 'lg',
            dialog: {
                heading: 'Настройки',
            }
        });
    }
}