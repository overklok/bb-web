import Presenter, {on} from "../../core/base/Presenter";
import BoardView from "../../views/board/BoardView";
import BoardModel, {BoardLayoutEvent, PlateEvent} from "../../models/common/BoardModel";
import TestkitModel, {TestkitChangeEvent} from "../../models/monkey/TestkitModel";
import {TestKitItemQuanitites} from "../../models/monkey/types";
import ReferenceBoardModel, {ReferenceRequestEvent} from "../../models/monkey/ReferenceBoardModel";
import {MountEvent} from "../../core/base/view/View";

export default class MonkeyPresenter extends Presenter<BoardView> {
    private testkit: TestkitModel;
    private board: BoardModel;
    private layout_name: string;
    private testkit_qtys: TestKitItemQuanitites;
    private reference: ReferenceBoardModel;

    protected ready() {
        this.view.registerLayouts(BoardModel.Layouts);

        this.board = this.getModel(BoardModel);
        this.testkit = this.getModel(TestkitModel);
        this.reference = this.getModel(ReferenceBoardModel);

        this.testkit_qtys = this.testkit.getQuantites();
    }

    @on(MountEvent)
    private onMount() {
        this.generateNewReference();
    }

    @on(BoardLayoutEvent)
    private setReferenceLayout(evt: BoardLayoutEvent) {
        this.layout_name = evt.layout_name

        this.view.setLayout(evt.layout_name);
    }

    @on(TestkitChangeEvent)
    private setReferenceTestkit(evt: TestkitChangeEvent) {
        this.testkit_qtys = evt.qtys;
    }

    @on(ReferenceRequestEvent)
    private generateNewReference() {
        if (!this.view) return;

        let protos = [];

        for (const [i, tki] of TestkitModel.FullTestKit.entries()) {
            protos[i] = {type: tki.type, extra: tki.extra, quantity: this.testkit_qtys[i]}
        }

        this.view.setPlates([]);
        this.view.setRandom(protos, 2, 0);
        this.reference.setReference(this.view.getPlates());
    }
}