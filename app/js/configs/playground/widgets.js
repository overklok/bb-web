import BoardView from "../../views/board/BoardView";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import BlocklyCodePresenter from "../../presenters/common/BlocklyCodePresenter";
import BlocklyView from "../../views/code/BlocklyView";
import LaunchView from "../../views/controls/LaunchView";
import LaunchPresenter from "../../presenters/playground/LaunchPresenter";

export default {
    board: {view_type: BoardView, presenter_types: [BoardPresenter], view_options: {readonly: false}},
    blockly: {view_type: BlocklyView, presenter_types: [BlocklyCodePresenter]},
    launcher: {view_type: LaunchView, presenter_types: [LaunchPresenter]}
}