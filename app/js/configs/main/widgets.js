import {BoardView} from "../../views/board/BoardView";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import BlocklyView from "../../views/code/BlocklyView";
import BlocklyCodePresenter from "../../presenters/common/BlocklyCodePresenter";
import {NavbarView} from "../../views/controls/NavbarView";
import NavbarPresenter from "../../presenters/controls/NavbarViewPresenter";

export default {
    navbar: {view_type: NavbarView.NavbarView, presenter_types: [NavbarPresenter], view_options: {overflow: 'hidden'}},
    board: {view_type: BoardView.BoardView, presenter_types: [BoardPresenter], view_options: {readonly: false}},
    blockly: {view_type: BlocklyView, presenter_types: [BlocklyCodePresenter]}
}