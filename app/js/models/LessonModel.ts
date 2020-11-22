import {cloneDeep} from "lodash";
import RestModel, {CRUDAction, PathParams, RestSchema} from "../core/base/model/RestModel";
import {Query} from "../core/models/datasources/HttpDatasource";

const enum LaunchMode {
    DoNothing = 0,
    CheckOnly = 1,
    ExecuteOnly = 2,
    ExecuteAndCheck = 3
}

const enum CodeCheckType {
    Commands = 0,
    States = 1
}

const enum BoardCheckType {
    Hard = 0,
    Soft = 1
}

const enum ExerciseType {
    CircuitAssembly     = 0,
    ProgramAssembly     = 1,
    ButtonPressSeq      = 2,
    Combined            = 3, // todo: the mode is obsolete, needs to be deprecated
    ElectronicAssembly  = 4, // todo: the mode is obsolete, needs to be deprecated
    Arduino             = 6,
}

const enum BoardMode {
    Default = 'default',
    Programming = 'programming',
    Electronics = 'electronics',
    Arduino = 'arduino'
}

type CodeModuleSettings = {
    block_types: {[block_name: string]: number};
    check_type: CodeCheckType;
    editable: boolean;
    max_blocks: number;
}

type BoardModuleSettings = {
    check_type: BoardCheckType,
    editable: boolean;
    mode: BoardMode;
}

type ButtonModuleSettings = {
    model: string[]|null;
}

type Popover = {
    id: number;
    title: string;
    content: string;
}

type Exercise = {
    id: number;
    name: string;
    is_sandbox: boolean;
    message_success: string;
    layout_mode: string;
    launch_mode: LaunchMode;
    popovers: Popover[];
    module_settings: {
        board?:     BoardModuleSettings,
        code?:      CodeModuleSettings,
        button?:    ButtonModuleSettings
    }
}

type Mission = {
    id: number;
    name: string;
    description: string;
    exercises: Exercise[];
}

export type Lesson = {
    id: number;
    name: string;
    description: string;
    missions: Mission[];
}

export default class LessonModel extends RestModel<Lesson> {
    protected defaultState: Lesson = undefined;

    private lesson: Lesson;

    protected schema(): RestSchema {
        return {
            [CRUDAction.Read]: ({l_id}) => `coursesvc/lesson/${l_id}`,
        }
    }

    init(state: Partial<Exercise>) {
        super.init(state);
        this.lesson = undefined;
    }

    async read(params: {lesson_id: number, exercise_id: number}, query?: Query): Promise<Lesson> {
        if (!(this.lesson && params.l_id == this.lesson.id)) {
            const lesson_raw = await super.list(params, query);
            this.lesson = LessonModel.processLesson(lesson_raw);
        }

        return this.lesson;
    }

    static processLesson(_lesson: any): Lesson {
        if (!(_lesson.missions) || _lesson.missions.length === 0) {
            throw new Error("Lesson does not have any missions");
        }

        let missions: Mission[] = [];

        for (let _mission of _lesson.missions) {
            missions.push(
                this.processMission(_mission)
            );
        }

        return {
            id: _lesson.pk,
            name: _lesson.name || "NONAME",
            description: _lesson.description || "NODESC",
            missions: missions
        };
    }

    static processMission(_mission: any): Mission {
        let exercises = [];

        for (let _exercise of _mission.exercises) {
            let exercise = this.processExercise(_exercise);

            if (exercise) exercises.push(exercise);
        }

        return {
            id: _mission.id,
            name: _mission.name,
            description: _mission.description,
            exercises: exercises
        }
    }

    static processExercise(_exercise: any): Exercise {
        let layout_mode, launch_mode, module_settings;

        let code: CodeModuleSettings = {
            editable: true,
            block_types: {},
            check_type: CodeCheckType.Commands,
            max_blocks: 0
        }

        let board: BoardModuleSettings = {
            editable: false,
            mode: BoardMode.Default,
            check_type: BoardCheckType.Hard
        }

        let button: ButtonModuleSettings = {
            model: null
        }

        // Code module settings
        code.editable = _exercise.type !== ExerciseType.ButtonPressSeq;
        code.block_types = _exercise.block_types;
        code.check_type = _exercise.check_type;
        code.max_blocks = _exercise.max_blocks;

        // Board module settings
        board.editable = _exercise.board_editable;
        board.check_type = _exercise.check_type_board;

        // Button module settings
        button.model = _exercise.buttons_model ? JSON.parse(_exercise.buttons_model) : [];

        switch (_exercise.type) {
            case ExerciseType.CircuitAssembly: {
                layout_mode = 'board';
                launch_mode = LaunchMode.CheckOnly;
                board.mode = BoardMode.Default;

                module_settings = {board};

                break;
            }
            case ExerciseType.ProgramAssembly: {
                layout_mode = 'code';
                launch_mode = LaunchMode.ExecuteAndCheck;
                board.mode = BoardMode.Programming;

                module_settings = {code};

                break;
            }
            case ExerciseType.ButtonPressSeq: {
                layout_mode = 'code_with_buttons';
                launch_mode = LaunchMode.DoNothing;
                board.mode = BoardMode.Programming;

                module_settings = {code, button};

                break;
            }
            case ExerciseType.Combined: {
                layout_mode = _exercise.display_buttons ? 'full_with_buttons' : 'full';
                launch_mode = LaunchMode.ExecuteAndCheck;
                board.mode = BoardMode.Programming;

                module_settings = {code, board, button};

                break;
            }
            case ExerciseType.ElectronicAssembly: {
                layout_mode = 'board';
                launch_mode = LaunchMode.CheckOnly;
                board.mode = BoardMode.Electronics;

                module_settings = {board};

                break;
            }
            case ExerciseType.Arduino: {
                // show_code_for_arduino is actually useless, so remove it when it starts to bore
                // the next line is also useless because arduino mode requires code by definition
                layout_mode = _exercise.show_code_for_arduino ? 'full' : 'board';

                if (layout_mode === 'full' && _exercise.display_buttons) {
                    layout_mode = 'full_with_buttons';
                }

                launch_mode = LaunchMode.ExecuteAndCheck;
                board.mode = BoardMode.Arduino;

                module_settings = {code, board, button};

                break;
            }
            default: {
                throw new Error(`Invalid exercise type '${_exercise.type}'`);
            }
        }

        // custom preference of launch mode is available if ExecuteAndCheck is available for the mode
        if (launch_mode === LaunchMode.ExecuteAndCheck) {
            if (_exercise._launch_variant === 1) {
                launch_mode = LaunchMode.CheckOnly
            }

            if (_exercise._launch_variant === 0) {
                launch_mode = LaunchMode.ExecuteOnly
            }
        }

        return {
            id: _exercise.pk,
            name: _exercise.name || "unnamed",
            popovers: cloneDeep(_exercise.popovers),
            message_success: _exercise.message_success,

            is_sandbox: _exercise.is_sandbox || false,
            layout_mode: layout_mode,
            launch_mode: launch_mode,
            module_settings: module_settings
        };
    };
}