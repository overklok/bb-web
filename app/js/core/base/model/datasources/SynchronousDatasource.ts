import Datasource from "../Datasource";
import Model from "../Model";

export default abstract class SynchronousDatasource extends Datasource {
    connectModel(model: Model<any>): void {}
}