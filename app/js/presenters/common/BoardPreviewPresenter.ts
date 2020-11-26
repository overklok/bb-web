import {BoardView} from "../../views/board/BoardView";
import Presenter, {on} from "../../core/base/Presenter";
import BoardModel, {Plate} from "../../models/common/BoardModel";
import {MountEvent} from "../../core/base/view/View";

interface PreviewBoard {
    plates: Plate[];
    layout: string;
}

export default class BoardPreviewPresenter extends Presenter<BoardView.BoardView> {
    public static previewBoard: PreviewBoard = {
        plates: [],
        layout: 'default'
    }

    public ready() {
        this.view.registerLayouts(BoardModel.Layouts);
    }

    @on(MountEvent)
    private onMount() {
        this.view.setLayout(BoardPreviewPresenter.previewBoard.layout);
        this.view.setPlates(BoardPreviewPresenter.previewBoard.plates);
    }
}