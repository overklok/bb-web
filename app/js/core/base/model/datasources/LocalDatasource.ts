import Datasource from "../Datasource";
import Model from "../Model";

export default abstract class LocalDatasource extends Datasource {
    connectModel(model: Model<any, any>): void {}
}