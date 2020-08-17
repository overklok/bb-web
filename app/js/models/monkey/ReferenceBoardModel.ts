import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import {ModelEvent} from "../../core/base/Event";
import {Plate} from "../common/BoardModel";

export class ReferenceEvent extends ModelEvent<ReferenceEvent> {
    plates: Plate[];
}

export class ReferenceRequestEvent extends ModelEvent<ReferenceRequestEvent> {}

export default class ReferenceBoardModel extends Model<undefined, DummyDatasource> {
    protected defaultState: undefined;

    public setReference(plates: Plate[]) {
        this.emit(new ReferenceEvent({plates}));
    }

    public requestNew() {
        this.emit(new ReferenceRequestEvent());
    }
}