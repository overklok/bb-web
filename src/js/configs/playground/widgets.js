import ModalView    from "../../core/views/ModalView";
import LayoutView   from "../../core/views/LayoutView";
import BoardView    from "../../views/common/BoardView";
import BlocklyView  from "../../views/common/BlocklyView";
import LaunchView   from "../../views/controls/LaunchView";

import LayoutPresenter      from "../../core/presenters/LayoutPresenter";
import ModalPresenter       from "../../core/presenters/ModalPresenter";
import BoardPresenter       from "../../presenters/common/BoardPresenter";
import BlocklyCodePresenter from "../../presenters/common/BlocklyPresenter";
import LaunchPresenter      from "../../presenters/controls/LaunchPresenter";

import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter]}
    ],
    widgets: {
        board: {
            view_type: BoardView.BoardView,
            presenter_types: [BoardPresenter],
            view_props: {schematic: true, readonly: false, verbose: false}
        },

        blockly: {
            view_type: BlocklyView,
            presenter_types: [BlocklyCodePresenter],
            view_props: {force_all_blocks: true}
        },

        launcher: {
            view_type: LaunchView.LaunchView,
            presenter_types: [LaunchPresenter],
        }
    }
}