import Model from "../core/base/model/Model";
import DummyDatasource from "../core/base/model/datasources/DummyDatasource";

export default class BreadboardModel extends Model<DummyDatasource> {
    load(): boolean {
        return false;
    }

    save(): void {

    }

    init(state: object | undefined): void {

    }
}