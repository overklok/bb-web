import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {ModelEvent} from "../base/Event";
import {Plate, PlateEvent} from "../../models/common/BoardModel";

interface KeyboardModelState {}

export default class KeyboardModel extends Model<KeyboardModelState, DummyDatasource> {
    defaultState = {}

    init(state: KeyboardModelState) {
        super.init(state);

        document.addEventListener("keyup", evt => {
            this.emit(new KeyUpEvent({
                orig: evt,
                code: evt.code,
                key: evt.key
            }));
        })
    }
}

export class KeyUpEvent extends ModelEvent<KeyUpEvent> {
    orig: KeyboardEvent;
    code: string;
    key: string;
}