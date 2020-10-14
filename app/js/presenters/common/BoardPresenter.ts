import Presenter, {on} from "../../core/base/Presenter";
import BoardView, {BoardChangeEvent, BoardLayoutChangeEvent} from "../../views/board/BoardView";
import BoardModel, {ElectronicEvent, BoardOptionsEvent, PlateEvent} from "../../models/common/BoardModel";

export default class BoardPresenter extends Presenter<BoardView> {
    private model: BoardModel;

    protected ready() {
        this.model = this.getModel(BoardModel);
        this.view.registerLayouts(BoardModel.Layouts);
        this.view.setLayout(this.model.getState().layout_name);
    }

    @on(BoardLayoutChangeEvent)
    private onLayoutChange(evt: BoardLayoutChangeEvent) {
        this.model.setBoardLayout(this.view.getLayoutName());
    }

    @on(BoardOptionsEvent)
    private onOptionsChange(evt: BoardOptionsEvent) {
        this.view.setReadOnly(evt.readonly);
    }

    @on(BoardChangeEvent)
    private onUserChange(evt: BoardChangeEvent) {
        this.model.setPlates(this.view.getPlates());
    }

    @on(PlateEvent)
    private onplates(evt: PlateEvent) {
        this.view.setPlates(evt.plates);
    }

    @on(ElectronicEvent)
    private onelec(evt: ElectronicEvent) {
        this.view.setCurrents(evt.threads);
    }
}