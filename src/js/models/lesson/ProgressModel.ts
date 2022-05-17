import {ExerciseSolution, Lesson} from "./LessonModel";
import {Course} from "./CourseModel";
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

export type MissionData = {
    code: any;
}

type ExerciseProgress = {
    id: number;
    is_passed: boolean;
    details: any;
};

type MissionProgress = {
    id: number;
    // index of current exercise inside the mission
    idx_exercise_current: number;
    // index of lastly passed exercise inside the mission
    idx_exercise_passed: number;
    // whether the mission is passed
    is_passed: boolean;
    details: any;
    data: MissionData;
    exercises: ExerciseProgress[];
};

type LessonProgress = {
    details: any;
    // index of current mission inside the lesson
    idx_mission_current: number;
    // index of lastly passed mission inside the lesson
    idx_mission_passed: number;
    // if loaded, defines whether the lesson is passed, else undefined
    is_passed: boolean;
    // if loaded, contains an array of missions, else undefined
    missions: MissionProgress[];
};

type CourseProgress = {
    id: number;
    details: any;
    lessons: {[id: number]: LessonProgress};
};

type Progress = {
    // progress by courses
    courses: CourseProgress[];
    // currently opened
    opened: {
        course_id: number;
        lesson_id: number;
    };
    // controls
    locks: {
        exercise: boolean;
        mission: boolean;
        lesson: boolean;
        course: boolean;
    }
}

export class LessonPassEvent extends ModelEvent<LessonPassEvent> {
    lesson_idx: number;
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
    data: MissionData;
}

export class ExerciseSolutionCommittedEvent extends ModelEvent<ExerciseSolutionCommittedEvent> {}
export class ExerciseSolutionValidatedEvent extends ModelEvent<ExerciseSolutionValidatedEvent> {
    error: string;
    verdict: ValidationVerdict;
}

export default class ProgressModel extends HttpModel<Progress> {
    static alias = 'progress';

    protected defaultState: Progress = {
        courses: undefined,
        opened: {
            course_id: undefined,
            lesson_id: undefined
        },
        locks: {
            exercise: false,
            mission: false,
            lesson: false,
            course: false
        }
    };

    private in_progress: boolean = false;

    public isStructureLoaded(): boolean {
        return !!this.state.courses;
    }

    /**
     * Initializes progress structure for the global application state
     * 
     * Re-initialization means that all progress will be lost.
     * 
     * Progress structure does not contain details of lessons
     * which will be loaded on demand by {@link loadLesson}
     * since it usually displays on another application screen.
     * 
     * @param courses initial course data
     */
    public loadStructure(courses: Course[]) {
        if (this.isStructureLoaded()) {
            console.warn("Another progress structure is already loaded");
            return;
        }

        const courses_: CourseProgress[] = [];

        for (const course of courses) {
            const lessons_: {[id: number]: LessonProgress} = {};

            for (const lesson of course.lessons) {
                lessons_[lesson.id] = {
                    // some details for views to provide navigation inside the structure
                    details: {},
                    // these flags are undefined before the lesson is loaded
                    idx_mission_current: undefined,
                    idx_mission_passed: undefined,
                    is_passed: undefined,
                    // missions will be loaded on demand by loadLesson()
                    missions: undefined
                };
            }

            const course_: CourseProgress = {
                // unique database identifier
                id: course.id,
                // some details for views to provide navigation inside the structure
                details: {},
                lessons: lessons_
            };

            courses_.push(course_);
        }

        this.setState({courses: courses_});
    }

    /**
     * Loads details for the given lesson
     * 
     * Opens given lesson which makes it available 
     * by {@link getOpenedLesson} and related methods.
     *
     * @param lesson        lesson data object
     * @param course_id     
     * @param force         reload even if the same lesson is provided
     */
    public loadLesson(lesson: Lesson, course_id: number, force: boolean = false) {
        const course = this.state.courses && this.state.courses.find(c => c.id == course_id);

        if (!course)         {throw new Error("Progress structure is not loaded");}
        if (!course.lessons) {throw new Error("Progress structure is invalid");}

        // set loaded lesson as opened
        this.setState({
            opened: {
                course_id: course_id,
                lesson_id: lesson.id
            }
        });

        if (!force && course.lessons[lesson.id].missions) {
            console.warn("Another lesson is already loaded, overwrite refused");
            return;
        }

        const progress: Partial<Progress> = {
            courses: [...this.state.courses],
            locks: {...this.state.locks}
        };

        const lesson_: LessonProgress = {
            idx_mission_current: 0,
            idx_mission_passed: -1,
            is_passed: false,
            details: {},
            missions: lesson.missions.map(m => ({
                id: m.id,
                idx_exercise_current: 0,
                idx_exercise_passed: -1,
                is_passed: false,
                details: {},
                data: {code: undefined},
                exercises: m.exercises.map(e => ({
                    id: e.id,
                    is_passed: false,
                    details: {},
                }))
            }))
        };

        course.lessons[lesson.id] = lesson_;

        this.setState(progress);

        this.emit(new LessonRunEvent());
    }

    public setOpenedMissionData(data: MissionData) {
        this.getOpenedMission().data = data;
    }

    public getOpenedExerciseIndex(): [number, number] {
        const lesson = this.getOpenedLesson();
        const mission = this.getOpenedMission();

        return [lesson.idx_mission_current, mission.idx_exercise_current];
    }

    /**
     * Proceeds to the next exercise
     * 
     * If current exercise is the last one inside the current mission,
     * the mission passes.
     */
    public passExercise(no_prompt?: boolean) {
        const lesson = this.getOpenedLesson();
        const mission = this.getOpenedMission();
        const exercise = mission.exercises[mission.idx_exercise_current];

        const was_passed = exercise.is_passed;

        exercise.is_passed = true;
        mission.idx_exercise_passed = mission.idx_exercise_current;

        // if (!was_passed) {
            if (mission.exercises.length - 1 === mission.idx_exercise_passed) {
                this.passMission(no_prompt);
            } else {
                mission.idx_exercise_current += 1;

                this.emit(new ExercisePassEvent({
                    mission_idx: lesson.idx_mission_current,
                    exercise_idx: mission.idx_exercise_current,
                    no_prompt: no_prompt
                }));
            }
        // }
    }

    /**
     * Run the next exercise in current mission if available
     */
    public stepForwardMission() {
        if (this.in_progress) return;

        const lesson = this.getOpenedLesson();
        const mission = this.getOpenedMission();

        this.emit(new ExerciseRunEvent({
            mission_idx: lesson.idx_mission_current,
            exercise_idx: mission.idx_exercise_current
        }));
    }

    /**
     * Runs last exercise available in the current mission
     *
     * This is a shortcut to {@see this.switchExercise()} method call.
     */
    public fastForwardMission() {
        if (this.in_progress) return;

        const lesson = this.getOpenedLesson();
        const mission = this.getOpenedMission();

        this.switchExercise(
            lesson.idx_mission_passed, 
            mission.idx_exercise_passed
        );
    }

    /**
     * Runs first exercise in the current mission
     *
     * This is a shortcut to {@see this.switchExercise()} method call.
     */
    public restartMission() {
        if (this.in_progress) return;

        const lesson = this.getOpenedLesson();

        this.switchExercise(lesson.idx_mission_current, 0);
    }

    /**
     * Switches current exercise pointer in the mission
     *
     * Restricts if mission/exercise lock is enabled.
     *
     * @param mission_idx   mission to switch the exercise pointer in
     * @param exercise_idx  index of exercise to switch to
     */
    public switchExercise(mission_idx: number, exercise_idx: number = undefined) {
        if (this.in_progress) return;

        exercise_idx = exercise_idx != null ? exercise_idx : 0;

        const lesson = this.getOpenedLesson();

        if (!(mission_idx in lesson.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        const mission = lesson.missions[mission_idx];

        if (exercise_idx > mission.exercises.length - 1) {
            throw new RangeError(`Exercise ${exercise_idx} does not exist in mission ${mission_idx}`);
        }

        if (this.state.locks.mission) {
            if (mission_idx !== 0 && mission_idx > lesson.idx_mission_passed) {
                console.debug('Forbidden mission switch prevented: `lock_missions` enabled');
                return;
            }
        }

        if (this.state.locks.exercise) {
            if (exercise_idx !== 0 && exercise_idx > mission.idx_exercise_passed) {
                console.debug('Forbidden exercise switch prevented: `lock_exercises` enabled');
                return;
            }
        }

        mission.idx_exercise_current = exercise_idx;

        // Emit only if switching in the mission currently running
        // External modules should switch to actual mission if they want to receive the run event
        if (mission_idx === lesson.idx_mission_current) {
            this.emit(new ExerciseRunEvent({
                mission_idx,
                exercise_idx
            }));
        }
    }

    /**
     * Switches mission pointer
     *
     * Restricts if mission lock is enabled
     *
     * @param mission_idx
     */
    public switchMission(mission_idx?: number) {
        if (this.in_progress) return;

        mission_idx = mission_idx | 0;

        const lesson = this.getOpenedLesson();

        if (!(lesson.missions && mission_idx in lesson.missions)) {
            throw new RangeError(`Mission ${mission_idx} does not exist in this lesson`);
        }

        const mission = this.getOpenedMission();

        if (this.state.locks.mission) {
            if (mission_idx !== 0 && mission_idx > lesson.idx_mission_passed) {
                console.debug('Forbidden mission switch prevented: `lock_missions` enabled');
                return;
            }
        }

        if (lesson.idx_mission_current !== mission_idx) {
            lesson.idx_mission_current = mission_idx;

            const exercise_idx = mission.idx_exercise_current;

            this.emit(new ExerciseRunEvent({
                mission_idx,
                exercise_idx,
            }));

            this.emit(new MissionRunEvent({
                mission_idx,
                data: mission.data
            }));
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

    /**
     * Passes the current mission
     *
     * @private
     */
    private passMission(no_prompt?: boolean) {
        if (this.in_progress) return;

        const lesson = this.getOpenedLesson();

        const mission = this.getOpenedMission();
        mission.is_passed = true;

        if (lesson.idx_mission_current < lesson.missions.length - 1) {
            lesson.idx_mission_passed = lesson.idx_mission_current;

            this.emit(new MissionPassEvent({
                mission_idx: lesson.idx_mission_current + 1,
                no_prompt
            }));
        } else {
            this.emit(new MissionPassEvent({
                mission_idx: lesson.idx_mission_current + 1,
                no_prompt
            }));
        }
    }

    /**
     * @returns current lesson if available else undefined
     */
    public getOpenedLesson() {
        const course = this.state.courses && this.state.courses.find(c => c.id === this.state.opened.course_id);
        console.log('gop', this.state.opened);
        
        return course && course.lessons[this.state.opened.lesson_id];
    }

    /**
     * @returns current mission for opened lesson if available else undefined
     */
    private getOpenedMission() {
        const lesson = this.getOpenedLesson();
        return lesson.idx_mission_current > - 1 && lesson.missions[lesson.idx_mission_current];
    }

    /**
     * @returns current exercise for opened lesson if available else undefined
     */
    private getOpenedExercise() {
        const mission = this.getOpenedMission();
        return mission.idx_exercise_current > -1 && mission.exercises[mission.idx_exercise_current];
    }
}

export function getLessonExercisesStats(lesson: LessonProgress) {
    if (!lesson.missions) return { total: 0, passed: 0 };

    return {
        total:  lesson.missions.reduce((sum, m) => sum + m.exercises.length, 0),
        passed: lesson.missions.reduce((sum, m) => sum + m.exercises.reduce((sum, e) => sum + Number(e.is_passed), 0), 0), 
    }
}

export function getLessonMissionsStats(lesson: LessonProgress) {
    if (!lesson.missions) return { total: 0, passed: 0 };

    return {
        total: lesson.missions.length, 
        passed: lesson.missions.filter(m => m.is_passed).length
    }
}