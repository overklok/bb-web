import RestModel, {CRUDAction, RestSchema} from "../core/base/model/RestModel";

type CourseLesson = {
    pk: number;
    fields: {
        name: string;
        description: string;
    }
}

type Course = {
    pk: number;
    lessons: CourseLesson[];
    fields: {
        name: string;
        description: string;
    }
}

export default class CourseModel extends RestModel<Course> {
    protected schema(): RestSchema {
        return {
            [CRUDAction.List]: () => `courses`,
        }
    }

    async test() {
        await this.read({id: 12});
    }

    protected defaultState: Course = undefined;
}