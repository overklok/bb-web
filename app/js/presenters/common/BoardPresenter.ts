import Presenter, {on} from "../../core/base/Presenter";
import {BoardView} from "../../views/board/BoardView";
import BoardModel, {ElectronicEvent, BoardOptionsEvent, PlateEvent} from "../../models/common/BoardModel";

export default class BoardPresenter extends Presenter<BoardView.BoardView> {
    private model: BoardModel;

    public getInitialProps() {
        this.model = this.getModel(BoardModel);

        return {
            layouts: BoardModel.Layouts,
            layout_name: this.model.getState().layout_name
        }
    }

    @on(BoardView.LayoutChangeEvent)
    private onLayoutChange() {
        this.model.setBoardLayout(this.view.getLayoutName());
    }
    
    @on(BoardView.BoardChangeEvent)
    private onUserChange() {
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