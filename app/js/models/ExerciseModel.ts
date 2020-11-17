import RestModel, {CRUDAction, PathParams, RestSchema} from "../core/base/model/RestModel";
import {Query} from "../core/models/datasources/HttpDatasource";

type Popover = {
    pk: number;
    title: string;
    content: string;
}

type Exercise = {
    pk: number;
    name: string;
    hidden: boolean;
    is_sandbox: boolean;
    board_editable: boolean;
    display_buttons: boolean;
    display_codenet: boolean;
    max_blocks: number;
    check_type: number;
    check_type_board: number;
    launch_variant: number;
    message_success: string;
    buttons_model: string[]; // todo
    block_types: string[]; // todo

    popovers: Popover[];
}

type Lesson = {
    pk: number;
    name: string;
    description: string;
    exercises: Exercise[];
}

export default class ExerciseModel extends RestModel<Exercise> {
    private lesson: Lesson;
    protected schema(): RestSchema {
        return {
            [CRUDAction.List]: ({l_id}) => `coursesvc/lesson/${l_id}`,
        }
    }

    init(state: Partial<Exercise>) {
        super.init(state);
        this.lesson = undefined;
    }

    async list(params: {l_id: number}, query?: Query): Promise<Lesson> {
        if (!(this.lesson && params.l_id == this.lesson.pk)) {
            this.lesson = await super.list(params, query);
        }

        return this.lesson;
    }

    async read(params: {lesson_id: number, exercise_id: number}): Promise<Exercise> {
        const lesson = await this.list({l_id: params.lesson_id});
        const exercise = lesson.exercises[params.exercise_id];

        this.setState(exercise);

        return exercise;
    }

    protected defaultState: Exercise = undefined;
}