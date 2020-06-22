import BoardView from "../views/BoardView";
import BoardPresenter from "../presenters/BoardPresenter";
import BlocklyView from "../views/BlocklyView";

export default {
    board: {view_type: BoardView, presenter_types: [BoardPresenter, BoardPresenter]},
    blockly: {view_type: BlocklyView, presenter_types: []}
}