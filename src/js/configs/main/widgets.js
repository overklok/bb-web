import OverlayViewComposer from "~/js/core/base/view/viewcomposers/OverlayViewComposer";

/* Generic Views */
import AlertView        from "~/js/core/views/AlertView";
import ModalView        from "~/js/core/views/ModalView";
import ToastView        from "~/js/core/views/ToastView";
import LayoutView       from "~/js/core/views/LayoutView";

/* Application-specific Views */
import BoardView        from "~/js/views/common/BoardView";
import BlocklyView      from "~/js/views/common/BlocklyView";
import KeyboardView     from "~/js/views/common/KeyboardView";
import TopbarView       from "~/js/views/controls/TopbarView";
import LaunchView       from "~/js/views/controls/LaunchView";
import RichTextView     from "~/js/views/common/RichTextView";
import HomeView         from "~/js/views/common/HomeView";
import VariableView     from "~/js/views/common/VariableView";
import {SettingsView}   from "~/js/views/controls/SettingsView";
import AboutView        from "~/js/views/controls/AboutView";
import IssueView        from "~/js/views/controls/IssueView";
import UpdateView       from "~/js/views/controls/UpdateView";

/* Basic Presenters */
import AlertPresenter           from "~/js/core/presenters/AlertPresenter";
import LayoutPresenter          from "~/js/core/presenters/LayoutPresenter";
import ModalPresenter           from "~/js/core/presenters/ModalPresenter";
import ToastPresenter           from "~/js/core/presenters/ToastPresenter";
import BoardPresenter           from "~/js/presenters/common/BoardPresenter";
import BlocklyCodePresenter     from "~/js/presenters/common/BlocklyPresenter";
import TopbarPresenter          from "~/js/presenters/controls/TopbarPresenter";
import LaunchPresenter          from "~/js/presenters/controls/LaunchPresenter";
import SettingsPresenter        from "~/js/presenters/controls/SettingsPresenter";
import LessonTaskPresenter      from "~/js/presenters/lesson/TaskLessonPresenter";
import LessonMenuPresenter      from "~/js/presenters/lesson/MenuLessonPresenter";

/* App-specific Presenters */
import LayoutLessonPresenter            from "~/js/presenters/lesson/LayoutLessonPresenter";
import BlocklyLessonPresenter           from "~/js/presenters/lesson/BlocklyLessonPresenter";
import LaunchLessonPresenter            from "~/js/presenters/lesson/LaunchLessonPresenter";
import BoardLessonPresenter             from "~/js/presenters/lesson/BoardLessonPresenter";
import PopoverContentLessonPresenter    from "~/js/presenters/lesson/PopoverContentLessonPresenter";
import LessonKeyboardPresenter          from "~/js/presenters/lesson/KeyboardLessonPresenter";
import VariableLessonPresenter          from "~/js/presenters/lesson/VariablesLessonPresenter";
import PopoverLessonPresenter           from "~/js/presenters/lesson/PopoverLessonPresenter";
import AlertLessonPresenter             from "~/js/presenters/lesson/AlertLessonPresenter";
import SettingsModalPresenter           from "~/js/presenters/controls/SettingsModalPresenter";
import AboutPresenter                   from "~/js/presenters/controls/AboutPresenter";
import IssuePresenter                   from "~/js/presenters/controls/IssuePresenter";
import UpdateModalPresenter             from "~/js/presenters/controls/UpdateModalPresenter";
import UpdatePresenter                  from "~/js/presenters/controls/UpdatePresenter";

export default function(no_menu) {
    return {
        composer: OverlayViewComposer,
        root: [
            {view_type: LayoutView, presenter_types: [LayoutPresenter, LayoutLessonPresenter]},
            {view_type: ToastView, presenter_types: [ToastPresenter]},
            {view_type: ModalView, presenter_types: [
                ModalPresenter, 
                PopoverLessonPresenter, 
                SettingsModalPresenter,
            ]},
            {view_type: AlertView, presenter_types: [AlertPresenter, AlertLessonPresenter]},
            {view_type: ModalView, presenter_types: [UpdateModalPresenter]}
        ],
        widgets: {
            update: {
                view_type: UpdateView.UpdateView,
                presenter_types: [UpdatePresenter]
            },
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
                view_props: {no_menu},
                nest_style: {overflow: 'hidden'}
            },
            board: {
                view_type: BoardView.BoardView,
                presenter_types: [BoardPresenter, BoardLessonPresenter],
                view_props: {readonly: true, bg_visible: false}
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
            about: {
                view_type: AboutView.AboutView,
                presenter_types: [AboutPresenter]
            },
            issue: {
                view_type: IssueView.IssueView,
                presenter_types: [IssuePresenter]
            }
        }
    }
}