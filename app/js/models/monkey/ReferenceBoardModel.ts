import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import {TestKit, TestKitItemQuanitites} from "./types";
import {ModelEvent} from "../../core/base/Event";
import {BoardLayout, Plate} from "../common/BoardModel";

export class ReferenceEvent extends ModelEvent<ReferenceEvent> {
    plates: Plate[];
}

export default class ReferenceBoardModel extends Model<undefined, DummyDatasource> {
    protected defaultState: undefined;

    setBoardParams(params: BoardLayout): void {
        this.setState({params});
    }

    setTestKit(testkit: TestKit, qtys: TestKitItemQuanitites) {

    }

    generateReference() {

    }
}