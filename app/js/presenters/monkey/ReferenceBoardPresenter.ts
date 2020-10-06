import Presenter, {on} from "../../core/base/Presenter";
import BoardView from "../../views/board/BoardView";
import BoardModel, {BoardLayoutEvent, PlateEvent} from "../../models/common/BoardModel";
import TestkitModel, {ReferenceRequestEvent, TestkitChangeEvent} from "../../models/monkey/TestkitModel";
import {TestKitItemQuanitites} from "../../models/monkey/types";
import {MountEvent} from "../../core/base/view/View";

export default class MonkeyPresenter extends Presenter<BoardView> {
    private testkit: TestkitModel;
    private board: BoardModel;
    private layout_name: string;

    private testkit_qtys: TestKitItemQuanitites;
    private testkit_size: number;
    private testkit_size_deviation: number;

    protected ready() {
        this.view.registerLayouts(BoardModel.Layouts);

        this.board = this.getModel(BoardModel);
        this.testkit = this.getModel(TestkitModel);

        const {qtys, size, size_deviation} = this.testkit.getState();

        this.testkit_qtys = qtys;
        this.testkit_size = size;
        this.testkit_size_deviation = size_deviation;
    }

    @on(MountEvent)
    private onMount() {
        this.generateNewReference();
    }

    @on(BoardLayoutEvent)
    private setReferenceLayout(evt: BoardLayoutEvent) {
        this.layout_name = evt.layout_name

        this.view.setLayout(evt.layout_name);
        this.generateNewReference();
    }

    @on(TestkitChangeEvent)
    private setReferenceTestkit(evt: TestkitChangeEvent) {
        this.testkit_qtys = evt.qtys;
        this.testkit_size = evt.size;
        this.testkit_size_deviation = evt.size_deviation;
        this.generateNewReference();
    }

    @on(ReferenceRequestEvent)
    private generateNewReference() {
        if (!this.view) return;

        let protos = [];

        for (const [i, tki] of TestkitModel.FullTestKit.entries()) {
            protos[i] = {type: tki.type, extra: tki.extra, quantity: this.testkit_qtys[i]}
        }

        this.view.setPlates([]);
        this.view.setRandom(protos, this.testkit_size, this.testkit_size_deviation);
        this.testkit.setReference(this.view.getPlates());
    }
}