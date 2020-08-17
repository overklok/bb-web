import Presenter, {on} from "../../core/base/Presenter";
import BoardView from "../../views/board/BoardView";
import ReferenceBoardModel from "../../models/monkey/ReferenceBoardModel";

export default class MonkeyPresenter extends Presenter<BoardView> {
    private board: ReferenceBoardModel;

    protected ready() {
        this.board = this.getModel(ReferenceBoardModel);
    }


}