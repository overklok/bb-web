import LessonModel from "../../models/LessonModel";
import KeyboardView from "../../views/common/KeyboardView";
import Presenter, {on, restore} from "../../core/base/Presenter";
import KeyboardModel, {KeySeqMatchEvent, KeyUpEvent} from "../../core/models/KeyboardModel";
import ProgressModel, {ExerciseRunEvent, LessonRunEvent} from "../../models/ProgressModel";


export default class KeyboardLessonPresenter extends Presenter<KeyboardView.KeyboardView> {
    private lesson: LessonModel;
    private keyboard: KeyboardModel;
    private progress: ProgressModel;

    public getInitialProps() {
        this.lesson = this.getModel(LessonModel);
        this.progress = this.getModel(ProgressModel);
        this.keyboard = this.getModel(KeyboardModel);
    }

    @restore() @on(ExerciseRunEvent)
    private onNewExercise(evt: ExerciseRunEvent) {
        const x = this.lesson.getExercise(evt.mission_idx, evt.exercise_idx);

        this.keyboard.reset();

        if (x.module_settings.button) {
            this.keyboard.setButtonSeqModel(x.module_settings.button.model);
        } else {
            this.keyboard.setButtonSeqModel(null);
        }

        this.setViewProps({
            buttons: this.keyboard.getState().buttons
        });
    }

    @on(KeySeqMatchEvent)
    private passExercise() {
        this.progress.passExercise();
    }

    @on(KeyUpEvent)
    private onButtonClick() {
        this.setViewProps({
            buttons: this.keyboard.getState().buttons
        });
    }
}