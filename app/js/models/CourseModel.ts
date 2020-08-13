import RestModel, {CRUDAction, RestSchema} from "../core/base/model/RestModel";

type Course = {
    id: number,

}

export default class CourseModel extends RestModel<Course> {
    protected schema(): RestSchema {
        return {
            [CRUDAction.Read]: ({id}) => `courses/${id}`,
        }
    }

    async test() {
        await this.read({id: 12});
    }

    protected defaultState: Course = undefined;
}