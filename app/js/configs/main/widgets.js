import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";

/* Generic Views */
import ModalView        from "../../core/views/modal/ModalView";
import LayoutView       from "../../core/views/layout/LayoutView";

/* Application-specific Views */
import BoardView        from "../../views/common/BoardView";
import BlocklyView      from "../../views/common/BlocklyView";
import KeyboardView     from "../../views/common/KeyboardView";
import TopbarView       from "../../views/controls/TopbarView";
import LaunchView       from "../../views/controls/LaunchView";
import RichTextView     from "../../views/common/RichTextView";
import LessonMenuView   from "../../views/common/LessonMenuView";
import VariableView     from "../../views/common/VariableView";

/* Basic Presenters */
import ModalPresenter           from "../../core/presenters/ModalPresenter";
import BoardPresenter           from "../../presenters/common/BoardPresenter";
import BlocklyCodePresenter     from "../../presenters/common/BlocklyCodePresenter";
import TopbarPresenter          from "../../presenters/controls/TopbarPresenter";
import LaunchPresenter          from "../../presenters/controls/LaunchPresenter";
import LayoutLessonPresenter    from "../../presenters/lesson/LayoutLessonPresenter";
import LessonTaskPresenter      from "../../presenters/lesson/LessonTaskPresenter";
import LessonMenuPresenter      from "../../presenters/lesson/LessonMenuPresenter";

/* Domain-specific Presenters */
import BlocklyLessonPresenter   from "../../presenters/lesson/BlocklyLessonPresenter";
import LaunchLessonPresenter    from "../../presenters/lesson/LaunchLessonPresenter";
import ModalLessonPresenter     from "../../presenters/lesson/PopoverPresenter";
import PopoverLessonPresenter   from "../../presenters/lesson/PopoverLessonPresenter";
import LessonKeyboardPresenter  from "../../presenters/lesson/LessonKeyboardPresenter";
import VariableLessonPresenter from "../../presenters/lesson/VariableLessonPresenter";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutLessonPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter, ModalLessonPresenter]}
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
        launcher: {
            view_type: LaunchView.LaunchView,
            presenter_types: [LaunchPresenter, LaunchLessonPresenter]
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
        },
        variables: {
            view_type: VariableView.VariableView,
            presenter_types: [VariableLessonPresenter],
        },
        keyboard: {
            view_type: KeyboardView.KeyboardView,
            presenter_types: [LessonKeyboardPresenter],
            nest_style: {overflow: 'hidden'}
        },
        popover_content: {
            view_type: RichTextView.RichTextView,
            presenter_types: [PopoverLessonPresenter],
        }
    }
}