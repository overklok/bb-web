import Model from "../core/base/model/Model";
import DummyDatasource from "../core/base/model/datasources/DummyDatasource";
import {Lesson} from "./LessonModel";

type MissionProgress = {
    skidding: boolean;
    exercise_count: number;
    exercise_idx: number;
    exercise_idx_last: number;
    exercise_idx_available: number;
}

type Progress = {
    mission_idx: number;
    missions: MissionProgress[];
    locked: boolean;
}

export default class InstructorModel extends Model<Progress, DummyDatasource> {
    protected defaultState: Progress = {
        mission_idx: undefined,
        missions: [],
        locked: true
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
            locked: this.state.locked
        };

        for (const mission of lesson.missions) {
            progress.missions.push({
                exercise_idx: 0,
                exercise_idx_last: -1,
                skidding: false,
                exercise_idx_available: 0,
                exercise_count: mission.exercises.length
            });
        }

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
     * Запустить следующее упражнение
     *
     * @param skid режим "буксовки" - только переключить указатели
     */
    public proceedExercise(skid=false) {
        // launchExerciseNext
    }

    /**
     * Выполнить безусловный переход к упражнению
     *
     * @param mission_idx  индекс миссии
     * @param exercise_idx индекс упражнения
     */
    public forceExercise(mission_idx: number, exercise_idx: number) {
        mission_idx = mission_idx | 0;
        exercise_idx = exercise_idx | 0;

        if (this.state.locked) {
            if (exercise_idx !== 0 && exercise_idx > this.state.missions[mission_idx].exercise_idx_last) {
                return;
            }
        }

        mission_idx = this.state.mission_idx;
        exercise_idx = this.state.missions[this.state.mission_idx].exercise_idx;

        if (!(mission_idx in this.state.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        if (!(exercise_idx < this.state.missions[mission_idx].exercise_count)) {
            throw new RangeError(`Exercise ${exercise_idx} does not exist in mission ${mission_idx}`);
        }

        if (this.state.mission_idx !== mission_idx) {
            this.state.mission_idx = mission_idx;
            // TODO: this.emit('mission')
        }

        this.launchExercise(exercise_idx, true);
    }

    /**
     * Запустить задание
     *
     * @param mission_idx индекс задания
     */
    private launchMission(mission_idx: number) {
        if (!(mission_idx in this.state.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        const mission_progress = this.state.missions[mission_idx];

        // launch last available exercise in the mission by default
        let exercise_idx = mission_progress.exercise_idx_available;

        // if same mission required and skidding is not enabled, reset the mission
        if (mission_idx === this.state.mission_idx && !mission_progress.skidding) {
            exercise_idx = 0;
        }

        // disable skidding
        mission_progress.skidding = false;

        // update current mission index
        this.state.mission_idx = mission_idx;

        // launch appropriate exercise within the mission
        this.launchExercise(exercise_idx);
    }


    /**
     * Запустить упражнение
     *
     * @param exercise_idx    индекс упражнения в текущей миссии
     * @param forced
     */
    private launchExercise(exercise_idx: number, forced: boolean = false) {
        const mission_idx = this.state.mission_idx,
              mission_progress = this.state.missions[mission_idx];

        if (!(0 <= exercise_idx && exercise_idx < mission_progress.exercise_count)) {
            throw new Error(`Exercise ${exercise_idx} in mission ${mission_idx} not found`);
        }

        // update exercise index within current mission
        this.state.missions[mission_idx].exercise_idx = exercise_idx;
        this.state.missions[mission_idx].exercise_idx_available = exercise_idx;

        // it makes no sense to emit exercise launch event if skidding is enabled
        if (forced || !mission_progress.skidding) {
            // TODO: this.emit("start")
        }

        // some users still can move manually in unlocked mode (as admin) so consider this a skid
        if (forced && !this.state.locked) {
            this.state.missions[mission_idx].skidding = true;
            this.state.missions[mission_idx].exercise_idx_available = exercise_idx;
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

    /**
     * Проверить, нужно ли обновлять прогресс
     *
     * Возможна ситуация, когда задание проходится второй раз.
     * В таких случаях прогресс остаётся неизменным.
     *
     * @param mission_idx индекс миссии
     *
     * @private
     */
    private _checkLessonProgress(mission_idx: number) {
        if (typeof mission_idx === "undefined") {return false}

        const mission_progress = this.state.missions[mission_idx];

        if (mission_progress.exercise_idx_last <= mission_progress.exercise_idx) {
            // TODO: this.emit("progress", {});

            mission_progress.exercise_idx_last = mission_progress.exercise_idx;
        }
    }
}