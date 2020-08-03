import DataSource from "./DataSource";

export interface ModelConstructor {
    new (state_initial?: object): Model<any>;
}

export default abstract class Model<V extends DataSource> {
    private data_source: V;

    protected constructor(state_initial?: object) {

    }

    connect(data_source: V) {
        data_source.connectModel(this);
        this.data_source = data_source;
    }

    abstract load(): boolean;
    abstract save(): void;
}