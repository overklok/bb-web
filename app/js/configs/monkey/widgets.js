import BoardView from "../../views/board/BoardView";
import TestkitView from "../../views/monkey/TestkitView";
import MonkeyView from "../../views/monkey/MonkeyView";
import MonkeyPresenter from "../../presenters/monkey/MonkeyPresenter";
import TestkitPresenter from "../../presenters/monkey/TestkitPresenter";
import TestkitModel from "../../models/monkey/TestkitModel";
import BoardPresenter from "../../presenters/common/BoardPresenter";
import ReferenceBoardPresenter from "../../presenters/monkey/ReferenceBoardPresenter";
import LogView from "../../views/monkey/LogView";
import BoardLogPresenter from "../../presenters/monkey/BoardLogPresenter";
import BoardPreviewPresenter from "../../presenters/common/BoardPreviewPresenter";

export default {
    board_disp: {view_type: BoardView, presenter_types: [BoardPresenter], view_options: {schematic: false, readonly: false}},
    board_ref: {view_type: BoardView, presenter_types: [ReferenceBoardPresenter], view_options: {schematic: false}},
    controls: {view_type: MonkeyView, presenter_types: [MonkeyPresenter]},
    testkit: {view_type: TestkitView, presenter_types: [TestkitPresenter], view_options: {items: TestkitModel.FullTestKit}},
    log: {view_type: LogView, presenter_types: [BoardLogPresenter]},

    board_preview: {
        view_type: BoardView, presenter_types: [BoardPreviewPresenter], view_options: {readonly: true, schematic: false}
    },
}