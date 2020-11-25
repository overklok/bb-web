import {BoardView} from "../../views/board/BoardView";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import BlocklyView from "../../views/code/BlocklyView";
import BlocklyCodePresenter from "../../presenters/common/BlocklyCodePresenter";
import {NavbarView} from "../../views/controls/NavbarView";
import NavbarPresenter from "../../presenters/controls/NavbarViewPresenter";
import LayoutView from "../../core/views/layout/LayoutView";
import LayoutPresenter from "../../core/presenters/LayoutPresenter";
import ModalView from "../../core/views/modal/ModalView";
import ModalPresenter from "../../core/presenters/ModalPresenter";
import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter]}
    ],
    widgets: {
        navbar: {
            view_type: NavbarView.NavbarView,
            presenter_types: [NavbarPresenter],
            view_options: {overflow: 'hidden'}
        },
        board: {
            view_type: BoardView.BoardView,
            presenter_types: [BoardPresenter],
            view_options: {readonly: false}
        },
        blockly: {
            view_type: BlocklyView,
            presenter_types: [BlocklyCodePresenter]
        }
    }
}