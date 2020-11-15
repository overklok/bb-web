import {BoardView} from "../../views/board/BoardView";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import BlocklyView from "../../views/code/BlocklyView";
import BlocklyCodePresenter from "../../presenters/common/BlocklyCodePresenter";

export default {
    board: {view_type: BoardView.BoardView, presenter_types: [BoardPresenter], view_options: {readonly: false}},
    blockly: {view_type: BlocklyView, presenter_types: [BlocklyCodePresenter]}
}