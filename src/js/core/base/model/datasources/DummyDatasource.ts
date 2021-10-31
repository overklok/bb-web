import Datasource from "../Datasource";
import Model from "../Model";

/**
 * @category Core
 * @subcategory Model
 */
export default class DummyDatasource extends Datasource {
    connectModel(model: Model<any, any>): void {}
}