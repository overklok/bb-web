import BoardView from "../../views/common/BoardView";
import Presenter, {on} from "../../core/base/Presenter";
import BoardModel, {Plate} from "../../models/common/BoardModel";
import {MountEvent} from "../../core/base/view/View";
import { SerializedPlate } from "src/js/utils/breadboard/core/Plate";

interface PreviewBoard {
    plates: SerializedPlate[];
    layout: string;
}

export default class BoardPreviewPresenter extends Presenter<BoardView.BoardView> {
    public static previewBoard: PreviewBoard = {
        plates: [],
        layout: 'v5x'
    }

    public getInitialProps() {
        return {
            layouts: BoardModel.Layouts,
            layout_name: BoardPreviewPresenter.previewBoard.layout
        }
    }

    @on(MountEvent)
    private onMount() {
        this.view.setLayout(BoardPreviewPresenter.previewBoard.layout);
        this.view.setPlates(BoardPreviewPresenter.previewBoard.plates);
    }
}