import Model from "../core/base/model/Model";
import DummyDataSource from "../core/base/model/datasources/DummyDataSource";

export default class BreadboardModel extends Model<DummyDataSource> {
    load(): boolean {
        return false;
    }

    save(): void {

    }
}