import BoardView from "../../views/board/BoardView";
import Presenter, {on} from "../../core/base/Presenter";
import {Plate} from "../../models/common/BoardModel";
import {MountEvent} from "../../core/base/view/View";

interface PreviewBoard {
    plates: Plate[];
}

export default class BoardPreviewPresenter extends Presenter<BoardView> {
    public static previewBoard: PreviewBoard = {
        plates: []
    }

    @on(MountEvent)
    private onMount() {
        this.view.setPlates(BoardPreviewPresenter.previewBoard.plates);
    }
}