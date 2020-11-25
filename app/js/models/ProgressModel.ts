import Model from "../core/base/model/Model";
import DummyDatasource from "../core/base/model/datasources/DummyDatasource";
import {Lesson} from "./LessonModel";
import {ModelEvent} from "../core/base/Event";

type MissionProgress = {
    exercise_last: number;
    exercise_idx: number;
    exercise_idx_available: number;
}

type Progress = {
    locked: boolean;
    missions: MissionProgress[];
    mission_idx: number;
    mission_idx_last: number;
    lesson_id: number;
}

export class LessonPassEvent extends ModelEvent<LessonPassEvent> {}
export class MissionPassEvent extends ModelEvent<MissionPassEvent> {
    mission_idx: number
}

export class LessonRunEvent extends ModelEvent<LessonRunEvent> {}
export class ExercisePassEvent extends ModelEvent<ExercisePassEvent> {
    mission_idx: number;
    exercise_idx: number;
}
export class ExerciseRunEvent extends ModelEvent<ExerciseRunEvent> {
    mission_idx: number;
    exercise_idx: number;
}

export default class ProgressModel extends Model<Progress, DummyDatasource> {
    protected defaultState: Progress = {
        locked: true,
        missions: [],
        mission_idx: undefined,
        mission_idx_last: undefined,
        lesson_id: undefined,
    };
    private button_seq_model: string[];
    private button_seq_idx: number;

    /**
     * Reset model state with the new lesson structure
     *
     * @param lesson lesson data object
     * @param force  reload even if the same lesson is provided
     */
    public loadLesson(lesson: Lesson, force: boolean = false) {
        if (this.state.lesson_id === lesson.id && !force) return;

        const progress: Progress = {
            lesson_id: lesson.id,
            missions: [],
            mission_idx: 0,
            mission_idx_last: 0,
            locked: this.state.locked
        };

        for (const mission of lesson.missions) {
            progress.missions.push({
                exercise_idx: 0,
                exercise_idx_available: 0,
                exercise_last: mission.exercises.length - 1
            });
        }

        progress.mission_idx_last = progress.missions.length - 1;

        this.setState(progress);

        this.emit(new LessonRunEvent());
    }

    /**
     * Возвратить индекс текущего упражнения
     */
    public getExerciseCurrent() {
        let missionIDX = this.state.mission_idx;
        let exerciseIDX = this.state.missions[missionIDX].exercise_idx;

        return [missionIDX, exerciseIDX];
    }

    /**
     * Pass the current exercise
     */
    public passExercise() {
        const mission_progress = this.state.missions[this.state.mission_idx];

        // this case may occur when switching exercises manually
        if (mission_progress.exercise_idx > mission_progress.exercise_idx_available) {
            // this case is available in admin mode only
            if (this.state.locked) throw new RangeError(`Trying to pass exercise that is not available yet.`);

            // sync available index to current (this means admin unfairly passes all previous exercises)
            mission_progress.exercise_idx_available = mission_progress.exercise_idx;
        }

        // current exercise is being passed another time (index isn't synced)
        if (mission_progress.exercise_idx < mission_progress.exercise_idx_available) {
            this.emit(new ExercisePassEvent({
                mission_idx: this.state.mission_idx,
                exercise_idx: mission_progress.exercise_idx
            }));
            return;
        }

        // `current` index is synced with `available` index
        if (mission_progress.exercise_last < mission_progress.exercise_idx_available) {
            // fairly increment the `available` index
            mission_progress.exercise_idx_available += 1;

            this.emit(new ExercisePassEvent({
                mission_idx: this.state.mission_idx,
                exercise_idx: mission_progress.exercise_idx
            }));
        } else {
            // if it's required to pass the last exercise, it's time to pass the entire mission
            this.passMission();
        }
    }

    /**
     * Run the next exercise in current mission if available
     */
    public stepForwardMission() {
        const mission_progress = this.state.missions[this.state.mission_idx];

        // current exercise is being passed another time (index isn't synced)
        if (mission_progress.exercise_idx < mission_progress.exercise_idx_available) {
            // just move current index forward until it syncs with the `available` index
            mission_progress.exercise_idx += 1;
        }

        this.emit(new ExerciseRunEvent({
            mission_idx: this.state.mission_idx,
            exercise_idx: mission_progress.exercise_idx
        }));
    }

    /**
     * Run the last exercise available in current mission
     */
    public fastForwardMission() {
        const mission_progress = this.state.missions[this.state.mission_idx];

        mission_progress.exercise_idx = mission_progress.exercise_idx_available;

        this.emit(new ExerciseRunEvent({
            mission_idx: this.state.mission_idx,
            exercise_idx: mission_progress.exercise_idx
        }));
    }

    /**
     * Run the first exercise in current mission
     */
    public restartMission() {
        this.state.missions[this.state.mission_idx].exercise_idx = 0;

        this.emit(new ExerciseRunEvent({
            mission_idx: this.state.mission_idx,
            exercise_idx: 0
        }));
    }

    /**
     * Выполнить безусловный переход к упражнению
     *
     * @param mission_idx  индекс миссии
     * @param exercise_idx индекс упражнения
     */
    public switchExercise(mission_idx: number, exercise_idx: number = 0) {
        mission_idx = mission_idx | 0;
        exercise_idx = exercise_idx | 0;

        if (!(mission_idx in this.state.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        if (!(exercise_idx < this.state.missions[mission_idx].exercise_last)) {
            throw new RangeError(`Exercise ${exercise_idx} does not exist in mission ${mission_idx}`);
        }

        if (this.state.locked) {
            if (exercise_idx !== 0 && exercise_idx > this.state.missions[mission_idx].exercise_idx_available) {
                return;
            }
        }

        if (this.state.mission_idx !== mission_idx) {
            this.state.mission_idx = mission_idx;
            this.emit(new ExerciseRunEvent({mission_idx, exercise_idx}));
        }
    }

    /**
     * Pass the current mission
     *
     * @private
     */
    private passMission() {
        if (this.state.mission_idx < this.state.mission_idx_last) {
            this.state.mission_idx += 1;
            this.state.missions[this.state.mission_idx].exercise_idx_available = 0;

            this.emit(new MissionPassEvent({
                mission_idx: this.state.mission_idx,
            }));
        } else {
            this.emit(new LessonPassEvent());
        }
    }

    /**
     * Установить эталонную последовательность нажатий клавиш
     *
     * @param button_seq_model эталонная последовательность нажатий клавиш
     */
    public setButtonSeqModel(button_seq_model: string[]) {
        this.button_seq_model = button_seq_model;
        this.button_seq_idx = 0;
    }

    /**
     * Проверить правильность нажатия клавиши
     *
     * @param button_code
     *
     * @returns sequence matches to model
     */
    public validateButtonPress(button_code: string): boolean {
        if (this.button_seq_model.length === 0) return;

        if (button_code === this.button_seq_model[this.button_seq_idx]) {
            if (this.button_seq_idx + 1 === this.button_seq_model.length) {
                this.button_seq_idx = 0;

                // TODO: this.emit('pass')
                return true;
            } else {
                this.button_seq_idx += 1;
            }
        }

        this.button_seq_idx = 0;

        return false;
    }
}