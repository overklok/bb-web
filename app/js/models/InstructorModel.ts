import Model from "../core/base/model/Model";
import DummyDatasource from "../core/base/model/datasources/DummyDatasource";
import {Lesson} from "./LessonModel";

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
}

export default class InstructorModel extends Model<Progress, DummyDatasource> {
    protected defaultState: Progress = {
        locked: true,
        missions: [],
        mission_idx: undefined,
        mission_idx_last: undefined
    };
    private button_seq_model: string[];
    private button_seq_idx: number;

    /**
     * Загрузить урок в модуль
     *
     * Происходит первичная обработка данных и установка указателей
     *
     * @param lesson JSON-пакет с данными урока
     */
    public loadLesson(lesson: Lesson) {
        const progress: Progress = {
            missions: [],
            mission_idx: undefined,
            mission_idx_last: undefined,
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
            // TODO: this.emit('exercise passed', 'another time')
            return;
        }

        // `current` index is synced with `available` index
        if (mission_progress.exercise_last < mission_progress.exercise_idx_available) {
            // fairly increment the `available` index
            mission_progress.exercise_idx_available += 1;
            // TODO: this.emit('exercise passed', 'first time')
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

        // TODO: this.emit('run exercise')
    }

    /**
     * Run the last exercise available in current mission
     */
    public fastForwardMission() {
        const mission_progress = this.state.missions[this.state.mission_idx];

        mission_progress.exercise_idx = mission_progress.exercise_idx_available;

        // TODO: this.emit('run exercise')
    }

    /**
     * Run the first exercise in current mission
     */
    public restartMission() {
        this.state.missions[this.state.mission_idx].exercise_idx = 0;

        // TODO: this.emit('run exercise')
    }

    /**
     * Выполнить безусловный переход к упражнению
     *
     * @param mission_idx  индекс миссии
     * @param exercise_idx индекс упражнения
     */
    public switchExercise(mission_idx: number, exercise_idx: number) {
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
            // TODO: this.emit('run exercise')
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
            // TODO: this.emit('mission passed')
        } else {
            // TODO: this.emit('lesson passed')
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
     * @param code
     */
    public validateButtonPress(button_code: string) {
        if (this.button_seq_model.length === 0) return;

        if (button_code === this.button_seq_model[this.button_seq_idx]) {
            if (this.button_seq_idx + 1 === this.button_seq_model.length) {
                this.button_seq_idx = 0;

                // TODO: this.emit('pass')
            } else {
                this.button_seq_idx += 1;
            }

            return true;
        }

        this.button_seq_idx = 0;

        return false;
    }
}