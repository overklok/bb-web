import Presenter, {on, restore} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel, {ElectronicEvent, BoardOptionsEvent, PlateEvent} from "../../models/common/BoardModel";

export default class BoardPresenter extends Presenter<BoardView.BoardView> {
    private board: BoardModel;

    public getInitialProps() {
        this.board = this.getModel(BoardModel);

        return {
            layouts: BoardModel.Layouts,
            layout_name: this.board.getState().layout_name
        }
    }

    @on(BoardView.LayoutChangeEvent)
    private onLayoutChange() {
        this.board.setBoardLayout(this.view.getLayoutName());
    }
    
    @on(BoardView.BoardChangeEvent)
    private onUserChange() {
        this.board.setUserPlates(this.view.getPlates());
    }

    @on(BoardOptionsEvent)
    private onOptionsChange(evt: BoardOptionsEvent) {
        this.view.setReadOnly(evt.readonly);
    }

    @restore() @on(PlateEvent)
    private onplates(evt: PlateEvent) {
        this.view.setPlates(evt.plates);
    }

    @restore() @on(ElectronicEvent)
    private onelec(evt: ElectronicEvent) {
        this.view.setCurrents(evt.threads);

        for (const element of evt.elements) {
            this.view.setPlateState(element.id, {
                ...element.dynamic,
                highlighted: element.highlight
            });
        }
    }
}