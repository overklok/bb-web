import Presenter, {on} from "../../core/base/Presenter";
import TestkitView from "../../views/monkey/TestkitView";
import TestkitModel from "../../models/monkey/TestkitModel";
import {MountEvent, UnmountEvent} from "../../core/base/view/View";

export default class TestkitPresenter extends Presenter<TestkitView> {
    private testkit: TestkitModel;

    protected ready() {
        this.testkit = this.getModel(TestkitModel);

        const {qtys, size, size_deviation} = this.testkit.getState();

        this.view.setOptions({
            qtys_initial: qtys,
            size_initial: size,
            size_deviation_initial: size_deviation
        });
    }

    @on(UnmountEvent)
    private saveValues() {
        this.testkit.setQuantities(this.view.getItemQuantities(), this.view.getSize(), this.view.getSizeDeviation());
    }
}