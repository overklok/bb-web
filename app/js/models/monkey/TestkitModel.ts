import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";

export type TestKitItem = {title: string, type: string, extra?: string|number, quantity: number};
export type TestKit = TestKitItem[];

export type TestKitItemQuanitites = number[];

export default class TestkitModel extends Model<TestKitItemQuanitites, DummyDatasource> {
    static FullTestKit: TestKit = [
        {title: 'Перемычка-2',          type: 'bridge',         quantity: 1, extra: 2},
        {title: 'Перемычка-3',          type: 'bridge',         quantity: 1, extra: 3},
        {title: 'Перемычка-4',          type: 'bridge',         quantity: 1, extra: 4},
        {title: 'Перемычка-5',          type: 'bridge',         quantity: 1, extra: 5},

        {title: 'Резистор 100 Ом',      type: 'resistor',       quantity: 1, extra: 100},
        {title: 'Резистор 1 кОм',       type: 'resistor',       quantity: 1, extra: 1000},
        {title: 'Резистор 3 кОм',       type: 'resistor',       quantity: 1, extra: 3000},
        {title: 'Резистор 10 кОм',      type: 'resistor',       quantity: 1, extra: 10000},

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
    protected defaultState: TestKitItemQuanitites =
        // generate an array with 0 .. N sequence
        Array(TestkitModel.FullTestKit.length).fill(0).map((_, i) => TestkitModel.FullTestKit[i].quantity);

    setQuantities(qtys: TestKitItemQuanitites) {
        this.setState(qtys);
    }

    getQuantites(): TestKitItemQuanitites {
        return this.getState();
    }
}