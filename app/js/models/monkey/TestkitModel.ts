import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import {TestKit, TestKitItemQuanitites} from "./types";
import {ModelEvent} from "../../core/base/Event";
import {Plate} from "../common/BoardModel";

export class TestkitChangeEvent extends ModelEvent<TestkitChangeEvent> {
    qtys: TestKitItemQuanitites;
    size: number;
    size_deviation: number;
}

export class ReferenceRequestEvent extends ModelEvent<ReferenceRequestEvent> {}
export class ReferenceEvent extends ModelEvent<ReferenceEvent> {
    plates: Plate[];
}

interface TestkitModelState {
    qtys: TestKitItemQuanitites;
    size: number;
    size_deviation: number;
}

export default class TestkitModel extends Model<TestkitModelState, DummyDatasource> {
    static FullTestKit: TestKit = [
        {title: 'Перемычка-2',          type: 'bridge',         quantity: 1, extra: 2},
        {title: 'Перемычка-3',          type: 'bridge',         quantity: 1, extra: 3},
        {title: 'Перемычка-4',          type: 'bridge',         quantity: 1, extra: 4},
        {title: 'Перемычка-5',          type: 'bridge',         quantity: 1, extra: 5},

        {title: 'Резистор 100 Ом',      type: 'resistor',       quantity: 1, extra: 100},
        {title: 'Резистор 1 кОм',       type: 'resistor',       quantity: 0, extra: 1000},
        {title: 'Резистор 3 кОм',       type: 'resistor',       quantity: 0, extra: 3000},
        {title: 'Резистор 10 кОм',      type: 'resistor',       quantity: 0, extra: 10000},

        {title: 'Конденсатор 100 мкФ',  type: 'capacitor',      quantity: 1, extra: 1e-4},
        {title: 'Конденсатор 1000 мкФ', type: 'capacitor',      quantity: 1, extra: 1e-3},

        {title: 'Светодиод (красный)',  type: 'LED',            quantity: 1, extra: 'R'},
        {title: 'Светодиод (зелёный)',  type: 'LED',            quantity: 1, extra: 'G'},

        {title: 'Кнопка',               type: 'button',         quantity: 1},
        {title: 'Ключ',                 type: 'switch',         quantity: 1},
        {title: 'Реостат',              type: 'rheostat',       quantity: 1},
        {title: 'Транзистор',           type: 'transistor',     quantity: 1},
        {title: 'Фоторезистор',         type: 'photoresistor',  quantity: 1},
        {title: 'Реле',                 type: 'relay',          quantity: 1},
        {title: 'Индуктор',             type: 'inductor',       quantity: 1},
        {title: 'Зуммер',               type: 'buzzer',         quantity: 1},
    ]

    /**
     * Define default state for TestkitModel
     */
    protected defaultState: TestkitModelState = {
        // generate an array with 0 .. N sequence
        qtys: Array(TestkitModel.FullTestKit.length).fill(0).map((_, i) => TestkitModel.FullTestKit[i].quantity),
        size: 10,
        size_deviation: 2
    }

    setQuantities(qtys: TestKitItemQuanitites, size: number, size_deviation: number) {
        this.setState({qtys, size, size_deviation});

        this.emit(new TestkitChangeEvent({qtys, size, size_deviation}));
    }

    public setReference(plates: Plate[]) {
        this.emit(new ReferenceEvent({plates}));
    }

    public requestNewReference() {
        this.emit(new ReferenceRequestEvent());
    }
}