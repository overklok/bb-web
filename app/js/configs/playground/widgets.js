import BoardView from "../../views/board/BoardView";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import BlocklyCodePresenter from "../../presenters/common/BlocklyCodePresenter";
import BlocklyView from "../../views/code/BlocklyView";
import LaunchView from "../../views/controls/LaunchView";
import LaunchPresenter from "../../presenters/playground/LaunchPresenter";
import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";
import LayoutView from "../../core/views/layout/LayoutView";
import LayoutPresenter from "../../core/presenters/LayoutPresenter";
import ModalView from "../../core/views/modal/ModalView";
import ModalPresenter from "../../core/presenters/ModalPresenter";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter]}
    ],
    widgets: {
        board: {view_type: BoardView, presenter_types: [BoardPresenter], view_options: {readonly: false}},
        blockly: {view_type: BlocklyView, presenter_types: [BlocklyCodePresenter]},
        launcher: {view_type: LaunchView, presenter_types: [LaunchPresenter]}
    }
}