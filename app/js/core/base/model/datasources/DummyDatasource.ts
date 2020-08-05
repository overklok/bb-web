import Datasource from "../Datasource";
import Model from "../Model";

export default class DummyDatasource extends Datasource {
    connectModel(model: Model<any>): void {}
}