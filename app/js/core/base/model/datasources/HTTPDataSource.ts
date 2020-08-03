import DataSource from "../DataSource";
import Model from "../Model";

export default class HTTPDataSource extends DataSource {
    connectModel(model: Model<any>): void {}
}