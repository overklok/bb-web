import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";

export type TestKitItem = {title: string, type: string, extra: string|number};
export type TestKit = TestKitItem[];

export type TestKitItemIndices = number[];

export default class TestkitModel extends Model<TestKitItemIndices, DummyDatasource> {
    static FullTestKit: TestKit = [
        {title: 'Перемычка-2', type: 'bridge', extra: 2},
        {title: 'Перемычка-3', type: 'bridge', extra: 2},
        {title: 'Перемычка-4', type: 'bridge', extra: 2},
        {title: 'Перемычка-5', type: 'bridge', extra: 2},
        {title: 'Перемычка-5', type: 'bridge', extra: 2},
        {title: 'Резистор 100 Ом', type: 'resistor', extra: 100},
        {title: 'Резистор 1 кОм', type: 'resistor', extra: 1000},
        {title: 'Резистор 3 кОм', type: 'resistor', extra: 3000},
        {title: 'Резистор 10 кОм', type: 'resistor', extra: 10000},
    ]

    /**
     * Define default state for TestkitModel
     */
    protected defaultState: TestKitItemIndices =
        // generate an array with 0 .. N sequence
        Array(TestkitModel.FullTestKit.length).fill(0).map((_, i) => i);


}