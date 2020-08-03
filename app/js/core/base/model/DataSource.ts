import Model from "./Model";

export default abstract class DataSource {
    abstract connectModel(model: Model<any>): void;
}