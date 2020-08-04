import DataSource from "../DataSource";
import Model from "../Model";

export default abstract class SynchronousDataSource extends DataSource {
    connectModel(model: Model<any>): void {}
}