import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";

/* Generic Views */
import AlertView        from "../../core/views/modal/AlertView";
import ModalView        from "../../core/views/modal/ModalView";
import ToastView        from "../../core/views/modal/ToastView";
import LayoutView       from "../../core/views/layout/LayoutView";

/* Application-specific Views */
import BoardView        from "js/views/common/BoardView";
import BlocklyView      from "js/views/common/BlocklyView";
import KeyboardView     from "js/views/common/KeyboardView";
import TopbarView       from "js/views/controls/TopbarView";
import LaunchView       from "js/views/controls/LaunchView";
import RichTextView     from "js/views/common/RichTextView";
import HomeView         from "js/views/common/HomeView";
import VariableView     from "js/views/common/VariableView";
import {SettingsView}   from "js/views/controls/SettingsView";

/* Basic Presenters */
import ModalPresenter           from "../../core/presenters/ModalPresenter";
import ToastPresenter           from "../../core/presenters/ToastPresenter";
import BoardPresenter           from "../../presenters/common/BoardPresenter";
import BlocklyCodePresenter     from "../../presenters/common/BlocklyPresenter";
import TopbarPresenter          from "../../presenters/controls/TopbarPresenter";
import LaunchPresenter          from "../../presenters/controls/LaunchPresenter";
import SettingsPresenter        from "../../presenters/controls/SettingsPresenter";
import LessonTaskPresenter      from "../../presenters/lesson/TaskLessonPresenter";
import LessonMenuPresenter      from "../../presenters/lesson/MenuLessonPresenter";

/* Domain-specific Presenters */
import LayoutLessonPresenter            from "../../presenters/lesson/LayoutLessonPresenter";
import BlocklyLessonPresenter           from "../../presenters/lesson/BlocklyLessonPresenter";
import LaunchLessonPresenter            from "../../presenters/lesson/LaunchLessonPresenter";
import BoardLessonPresenter             from "../../presenters/lesson/BoardLessonPresenter";
import PopoverContentLessonPresenter    from "../../presenters/lesson/PopoverContentLessonPresenter";
import LessonKeyboardPresenter          from "../../presenters/lesson/KeyboardLessonPresenter";
import VariableLessonPresenter          from "../../presenters/lesson/VariablesLessonPresenter";
import PopoverLessonPresenter           from "../../presenters/lesson/PopoverLessonPresenter";
import AlertBoardPresenter              from "../../presenters/lesson/AlertLessonPresenter";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutLessonPresenter]},
        {view_type: ToastView, presenter_types: [ToastPresenter]},
        {view_type: ModalView, presenter_types: [ModalPresenter]},
        // {view_type: ModalView, presenter_types: [ModalPresenter, PopoverLessonPresenter]},
        // {view_type: AlertView, presenter_types: [AlertBoardPresenter]},
    ],
    widgets: {
        courses: {
            view_type: HomeView.HomeView,
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
            presenter_types: [BoardPresenter, BoardLessonPresenter],
            view_props: {readonly: true}
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
            presenter_types: [PopoverContentLessonPresenter],
        },
        settings: {
            view_type: SettingsView.SettingsView,
            presenter_types: [SettingsPresenter],
        },
    }
}