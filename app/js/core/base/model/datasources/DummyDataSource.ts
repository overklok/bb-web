import DataSource from "../DataSource";
import Model from "../Model";

export default class DummyDataSource extends DataSource {
    connectModel(model: Model<any>): void {}
}