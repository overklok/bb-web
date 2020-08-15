import BoardView from "../../views/board/BoardView";
import TestkitView from "../../views/monkey/TestkitView";
import MonkeyView from "../../views/monkey/MonkeyView";
import MonkeyPresenter from "../../presenters/monkey/MonkeyPresenter";
import TestkitPresenter from "../../presenters/monkey/TestkitPresenter";
import TestkitModel from "../../models/monkey/TestkitModel";

export default {
    board_disp: {view_type: BoardView, presenter_types: [], view_options: {schematic: false, readonly: false}},
    board_ref: {view_type: BoardView, presenter_types: [], view_options: {schematic: false}},
    controls: {view_type: MonkeyView, presenter_types: [MonkeyPresenter]},
    testkit: {view_type: TestkitView, presenter_types: [TestkitPresenter], view_options: {items: TestkitModel.FullTestKit}},
}