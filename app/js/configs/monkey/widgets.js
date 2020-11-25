import ModalView    from "../../core/views/modal/ModalView";
import LayoutView   from "../../core/views/layout/LayoutView";
import {BoardView}  from "../../views/board/BoardView";
import TestkitView  from "../../views/monkey/TestkitView";
import MonkeyView   from "../../views/monkey/MonkeyView";
import LogView      from "../../views/monkey/LogView";

import LayoutPresenter          from "../../core/presenters/LayoutPresenter";
import ModalPresenter           from "../../core/presenters/ModalPresenter";
import BoardLogPresenter        from "../../presenters/monkey/BoardLogPresenter";
import BoardPresenter           from "../../presenters/common/BoardPresenter";
import MonkeyPresenter          from "../../presenters/monkey/MonkeyPresenter";
import TestkitPresenter         from "../../presenters/monkey/TestkitPresenter";
import ReferenceBoardPresenter  from "../../presenters/monkey/ReferenceBoardPresenter";
import BoardPreviewPresenter    from "../../presenters/common/BoardPreviewPresenter";

import OverlayViewComposer from "../../core/base/view/viewcomposers/OverlayViewComposer";

import TestkitModel from "../../models/monkey/TestkitModel";

export default {
    composer: OverlayViewComposer,
    root: [
        {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
        {view_type: ModalView, presenter_types: [ModalPresenter]}
    ],
    widgets: {
        board_disp: {
            view_type: BoardView.BoardView,
            presenter_types: [BoardPresenter],
            view_options: {schematic: false, readonly: false}
        },

        board_ref: {
            view_type: BoardView.BoardView,
            presenter_types: [ReferenceBoardPresenter],
            view_options: {schematic: false}
        },

        controls: {
            view_type: MonkeyView,
            presenter_types: [MonkeyPresenter]
        },

        testkit: {
            view_type: TestkitView,
            presenter_types: [TestkitPresenter],
            view_options: {items: TestkitModel.FullTestKit}
        },

        log: {
            view_type: LogView,
            presenter_types: [BoardLogPresenter]
        },

        board_preview: {
            view_type: BoardView.BoardView,
            presenter_types: [BoardPreviewPresenter],
            view_options: {readonly: true, schematic: false}
        },
    }
}