import ModalView    from "../../core/views/modal/ModalView";
import LayoutView   from "../../core/views/layout/LayoutView";
import BlocklyView  from "../../views/code/BlocklyView";
import {BoardView}  from "../../views/board/BoardView";
import {TopbarView} from "../../views/controls/TopbarView";
import {RichTextView} from "../../views/common/RichTextView";

import ModalPresenter       from "../../core/presenters/ModalPresenter";
import LayoutPresenter      from "../../presenters/common/LayoutPresenter";
import BoardPresenter       from "../../presenters/board/BoardPresenter";
import BlocklyCodePresenter from "../../presenters/code/BlocklyCodePresenter";

import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";
import BlocklyLessonPresenter from "../../presenters/code/BlocklyLessonPresenter";
import TopbarPresenter from "../../presenters/controls/TopbarPresenter";
import LessonTaskPresenter from "../../presenters/common/LessonTaskPresenter";
import {LessonMenuView} from "../../views/common/LessonMenuView";
import LessonMenuPresenter from "../../presenters/common/LessonMenuPresenter";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter]}
    ],
    widgets: {
        courses: {
            view_type: LessonMenuView.LessonMenuView,
            presenter_types: [LessonMenuPresenter],
        },
        task: {
            view_type: RichTextView.RichTextView,
            presenter_types: [LessonTaskPresenter],
        },
        navbar: {
            view_type: TopbarView.TopbarView,
            presenter_types: [TopbarPresenter],
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