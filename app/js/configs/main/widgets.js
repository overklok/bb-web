import ModalView    from "../../core/views/modal/ModalView";
import LayoutView   from "../../core/views/layout/LayoutView";
import BlocklyView  from "../../views/code/BlocklyView";
import {BoardView}  from "../../views/board/BoardView";
import {NavbarView} from "../../views/controls/NavbarView";

import ModalPresenter       from "../../core/presenters/ModalPresenter";
import LayoutPresenter      from "../../presenters/common/LayoutPresenter";
import BoardPresenter       from "../../presenters/common/BoardPresenter";
import NavbarPresenter      from "../../presenters/controls/NavbarPresenter";
import BlocklyCodePresenter from "../../presenters/common/BlocklyCodePresenter";

import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";
import BlocklyLessonPresenter from "../../presenters/common/BlocklyLessonPresenter";
import {TopbarView} from "../../views/controls/TopbarView";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter]}
    ],
    widgets: {
        navbar_react: {
            view_type: TopbarView.TopbarView,
            presenter_types: [],
            nest_style: {overflow: 'hidden'}
        },
        navbar: {
            view_type: NavbarView.NavbarView,
            presenter_types: [NavbarPresenter],
            nest_style: {overflow: 'hidden'}
        },
        board: {
            view_type: BoardView.BoardView,
            presenter_types: [BoardPresenter],
            view_props: {readonly: false}
        },
        blockly: {
            view_type: BlocklyView,
            presenter_types: [BlocklyCodePresenter, BlocklyLessonPresenter],
        }
    }
}