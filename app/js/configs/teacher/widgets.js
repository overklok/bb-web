import BoardView from "../../views/board/BoardView";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import BlocklyView from "../../views/blockly/BlocklyView";
import LayoutView from "../../core/views/layout/LayoutView";
import LayoutPresenter from "../../core/presenters/LayoutPresenter";

export default {
    main: {view_type: LayoutView, presenter_types: [LayoutPresenter]},

    board: {view_type: BoardView, presenter_types: [BoardPresenter, BoardPresenter]},
    // board2: {view_type: BoardView, presenter_types: [BoardPresenter]},
    blockly: {view_type: BlocklyView, presenter_types: []}
}