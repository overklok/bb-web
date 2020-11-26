import Presenter, {on} from "../../core/base/Presenter";
import {BoardView} from "../../views/board/BoardView";
import BoardModel, {ElectronicEvent, BoardOptionsEvent, PlateEvent} from "../../models/common/BoardModel";
import {ModelEvent, ViewEvent} from "../../core/base/Event";

export default class BoardPresenter extends Presenter<BoardView.BoardView> {
    private model: BoardModel;

    public ready() {
        this.model = this.getModel(BoardModel);
        this.view.registerLayouts(BoardModel.Layouts);
        this.view.setLayout(this.model.getState().layout_name);
    }

    @on(BoardView.LayoutChangeEvent)
    private onLayoutChange(evt: BoardView.LayoutChangeEvent) {
        this.model.setBoardLayout(this.view.getLayoutName());
    }
    
    @on(BoardView.BoardChangeEvent)
    private onUserChange(evt: BoardView.BoardChangeEvent) {
        this.model.setPlates(this.view.getPlates());
    }

    @on(BoardOptionsEvent)
    private onOptionsChange(evt: BoardOptionsEvent) {
        this.view.setReadOnly(evt.readonly);
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