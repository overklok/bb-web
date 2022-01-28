import {ExerciseSolution, Lesson} from "./LessonModel";
import {ModelEvent} from "~/js/core/base/Event";
import {RequestMethod} from "~/js/core/models/datasources/HttpDatasource";
import HttpModel from "~/js/core/models/HttpModel";

export enum ValidationVerdictStatus {
    Undefined = 'undefined',
    Success = 'success',
    Fail = 'fail',
    Error = 'error',
}

export type ValidationVerdict = {
    status: ValidationVerdictStatus;
    message: string;
    code: string;
    details: {
        region?: any
    };
}

export type ExerciseData = {
    code: any;
}

type MissionProgress = {
    // Current index of the exercise opened
    exercise_idx: number;
    // Maximum value of exercise index
    exercise_idx_last: number;
    // Lastly passed exercise index
    exercise_idx_passed: number;
    // Maximum value of lastly passed exercise index
    exercise_idx_passed_max: number;
    // Maximum value of exercise index user can assign to
    // (if lock_exercises is true)
    exercise_idx_available: number;

    data: ExerciseData;
}

type Progress = {
    // ID of the lesson opened
    lesson_id: number;
    // Array of per-mission sub-progresses
    missions: MissionProgress[];
    // Current index of the mission opened
    mission_idx: number;
    // Maximum value of mission index
    mission_idx_last: number;
    // Lastly passed mission index
    mission_idx_passed: number;
    // Maximum value of lastly passed mission index
    mission_idx_passed_max: number;
    // Maximum value of mission index user can assign to
    // (if lock_missions is true)
    mission_idx_available: number;

    // Whether to lock free exercise switching
    lock_exercises: boolean;
    // Whether to lock free mission switching
    lock_missions: boolean;
}

export class LessonPassEvent extends ModelEvent<LessonPassEvent> {

}

export class MissionPassEvent extends ModelEvent<MissionPassEvent> {
    mission_idx: number;
    no_prompt?: boolean;
}

export class ExercisePassEvent extends ModelEvent<ExercisePassEvent> {
    mission_idx: number;
    exercise_idx: number;
    no_prompt?: boolean;
}

export class LessonRunEvent extends ModelEvent<LessonRunEvent> {

}

export class ExerciseRunEvent extends ModelEvent<ExerciseRunEvent> {
    mission_idx: number;
    exercise_idx: number;
}

export class MissionRunEvent extends ModelEvent<MissionRunEvent> {
    mission_idx: number;
    data: ExerciseData;
}

export class ExerciseSolutionCommittedEvent extends ModelEvent<ExerciseSolutionCommittedEvent> {}
export class ExerciseSolutionValidatedEvent extends ModelEvent<ExerciseSolutionValidatedEvent> {
    error: string;
    verdict: ValidationVerdict;
}

export default class ProgressModel extends HttpModel<Progress> {
    static alias = 'progress';

    protected defaultState: Progress = {
        lesson_id: undefined,
        missions: [],
        mission_idx: undefined,
        mission_idx_last: undefined,
        mission_idx_passed: undefined,
        mission_idx_passed_max: undefined,
        mission_idx_available: undefined,
        lock_exercises: false,
        lock_missions: false,
    };

    private exercise_preferred: number;
    private in_progress: boolean = false;

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
            mission_idx: -1,
            mission_idx_last: 0,
            mission_idx_passed: -1,
            mission_idx_passed_max: -1,
            mission_idx_available: 0,
            lock_exercises: this.state.lock_exercises,
            lock_missions: this.state.lock_missions,
        };

        for (const mission of lesson.missions) {
            progress.missions.push({
                exercise_idx: 0,
                exercise_idx_available: 0,
                exercise_idx_passed: -1,
                exercise_idx_passed_max: -1,
                exercise_idx_last: mission.exercises.length - 1,
                data: null,
            });
        }

        progress.mission_idx_last = progress.missions.length - 1;

        this.setState(progress);

        this.emit(new LessonRunEvent());
    }

    public isLessonLoaded(): boolean {
        return this.getState().lesson_id != null;
    }

    /**
     * Возвратить индекс текущего упражнения
     */
    public getExerciseCurrent(): [number, number] {
        let missionIDX = this.state.mission_idx;
        let exerciseIDX = this.state.missions[missionIDX].exercise_idx;

        return [missionIDX, exerciseIDX];
    }

    public setMissionData(data: ExerciseData) {
        this.state.missions[this.state.mission_idx].data = data;
    }

    /**
     * Pass the current exercise
     */
    public passExercise(no_prompt?: boolean) {
        const mission_progress = this.state.missions[this.state.mission_idx];

        // this case may occur when switching exercises manually
        if (mission_progress.exercise_idx > mission_progress.exercise_idx_available) {
            // this case is available in admin mode only
            if (this.state.lock_exercises) throw new RangeError(`Trying to pass exercise that is not available yet.`);

            // sync available index to current (this means admin unfairly passes all previous exercises)
            mission_progress.exercise_idx_available = mission_progress.exercise_idx;
        }

        // current exercise is being passed another time (index isn't synced)
        if (mission_progress.exercise_idx < mission_progress.exercise_idx_available) {
            mission_progress.exercise_idx_passed += 1;

            this.emit(new ExercisePassEvent({
                mission_idx: this.state.mission_idx,
                exercise_idx: mission_progress.exercise_idx,
                no_prompt
            }));

            return;
        }

        // `current` index is synced with `available` index
        if (mission_progress.exercise_idx_available < mission_progress.exercise_idx_last) {
            // fairly increment the `available` index
            mission_progress.exercise_idx_available += 1;
            mission_progress.exercise_idx_passed += 1;
            mission_progress.exercise_idx_passed_max += 1;

            this.emit(new ExercisePassEvent({
                mission_idx: this.state.mission_idx,
                exercise_idx: mission_progress.exercise_idx
            }));
        } else {
            if (mission_progress.exercise_idx_passed < mission_progress.exercise_idx_last) {
                mission_progress.exercise_idx_passed += 1;
            }

            if (mission_progress.exercise_idx_passed_max < mission_progress.exercise_idx_last) {
                mission_progress.exercise_idx_passed_max += 1;
            }

            // if it's required to pass the last exercise, it's time to pass the entire mission
            this.passMission(no_prompt);
        }
    }

    /**
     * Run the next exercise in current mission if available
     */
    public stepForwardMission() {
        if (this.in_progress) return;

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
     *
     * This is a shortcut to {@see this.switchExercise()} method call
     */
    public fastForwardMission() {
        if (this.in_progress) return;

        const mission_progress = this.state.missions[this.state.mission_idx];

        this.switchExercise(this.state.mission_idx, mission_progress.exercise_idx_available);
    }

    /**
     * Run the first exercise in current mission
     *
     * This is a shortcut to {@see this.switchExercise()} method call
     */
    public restartMission() {
        if (this.in_progress) return;

        this.switchExercise(this.state.mission_idx, 0);
    }

    /**
     * Switch current exercise pointer in the mission
     *
     * Restrict if mission/exercise lock is enabled
     *
     * @param mission_idx   mission to switch the exercise pointer in
     * @param exercise_idx  index of exercise to switch to
     */
    public switchExercise(mission_idx: number, exercise_idx: number = undefined) {
        if (this.in_progress) return;

        exercise_idx = exercise_idx != null ? exercise_idx : this.exercise_preferred | 0;

        if (!(mission_idx in this.state.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        if (exercise_idx > this.state.missions[mission_idx].exercise_idx_last) {
            throw new RangeError(`Exercise ${exercise_idx} does not exist in mission ${mission_idx}`);
        }

        if (this.state.lock_missions) {
            if (mission_idx !== 0 && mission_idx > this.state.mission_idx_available) {
                console.debug('Forbidden mission switch prevented: `lock_missions` enabled');
                return;
            }
        }

        if (this.state.lock_exercises) {
            if (exercise_idx !== 0 && exercise_idx > this.state.missions[mission_idx].exercise_idx_available) {
                console.debug('Forbidden exercise switch prevented: `lock_exercises` enabled');
                return;
            }
        }

        // if (this.state.missions[mission_idx].exercise_idx !== exercise_idx) {
            this.state.missions[mission_idx].exercise_idx = exercise_idx;
            this.state.missions[mission_idx].exercise_idx_passed = exercise_idx - 1;

            // Emit only if switching in the mission currently running
            // External modules should switch to actual mission if they want to receive the run event
            if (mission_idx === this.state.mission_idx) {
                this.emit(new ExerciseRunEvent({
                    mission_idx,
                    exercise_idx
                }));
            }
        // }
    }

    /**
     * Switch mission pointer
     *
     * Restrict if mission lock is enabled
     *
     * @param mission_idx
     */
    public switchMission(mission_idx?: number) {
        if (this.in_progress) return;

        mission_idx = mission_idx | 0;

        if (!(mission_idx in this.state.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        if (this.state.lock_missions) {
            if (mission_idx !== 0 && mission_idx > this.state.mission_idx_available) {
                console.debug('Forbidden mission switch prevented: `lock_missions` enabled');
                return;
            }
        }

        if (this.state.mission_idx !== mission_idx ) {
            this.state.mission_idx = mission_idx;
            const exercise_idx = this.state.missions[mission_idx].exercise_idx;

            this.emit(new ExerciseRunEvent({
                mission_idx,
                exercise_idx,
            }));

            this.emit(new MissionRunEvent({
                mission_idx,
                data: this.state.missions[mission_idx].data
            }));
        }
    }

    /**
     * Pass the current mission
     *
     * @private
     */
    private passMission(no_prompt?: boolean) {
        if (this.in_progress) return;

        if (this.state.mission_idx < this.state.mission_idx_last) {
            // this.state.mission_idx += 1;
            this.state.mission_idx_available = this.state.mission_idx + 1;
            // this.state.missions[this.state.mission_idx].exercise_idx_available = 0;

            this.emit(new MissionPassEvent({
                mission_idx: this.state.mission_idx + 1,
                no_prompt
            }));
        } else {
            this.emit(new MissionPassEvent({
                mission_idx: this.state.mission_idx + 1,
                no_prompt
            }));
            // this.emit(new LessonPassEvent()); TODO: maybe needed, maybe not
        }
    }

    public validateExerciseSolution(exercise_id: number, solution: ExerciseSolution) {
        if (this.in_progress) return;

        this.in_progress = true;

        if (!!solution.board != !!solution.board_info) {
            throw new Error("`board_info` is required to provide with the `board`");
        }

        this.emit(new ExerciseSolutionCommittedEvent());

        this.request(`/courses/check/${exercise_id}`, {
            method: RequestMethod.POST,
            data: {
                handlers: solution.code || {},
                board: solution.board,
                board_info: solution.board_info,
                board_layout_name: solution.board_layout_name
            }
        }).then(res => {
            const verdict: ValidationVerdict = {
                message: res.message,
                status: res.status,
                code: res.code,
                details: {}
            };

            this.in_progress = false;

            this.emit(new ExerciseSolutionValidatedEvent({error: undefined, verdict: verdict}));
        }).catch(err => {
            console.error('Error', err);

            this.in_progress = false;

            this.emit(new ExerciseSolutionValidatedEvent({
                error: err.message,
                verdict: undefined
            }));
        });
    }
}