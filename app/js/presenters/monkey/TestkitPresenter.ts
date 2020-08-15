import Presenter, {on} from "../../core/base/Presenter";
import TestkitView from "../../views/monkey/TestkitView";
import TestkitModel from "../../models/monkey/TestkitModel";

export default class TestkitPresenter extends Presenter<TestkitView> {
    private testkit: TestkitModel;

    protected ready() {
        this.testkit = this.getModel(TestkitModel);
    }
}