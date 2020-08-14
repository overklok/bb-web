import BoardView from "../../views/board/BoardView";
import TestkitView from "../../views/monkey/TestkitView";
import MonkeyView from "../../views/monkey/MonkeyView";

export default {
    board_disp: {view_type: BoardView, presenter_types: [], view_options: {schematic: false, readonly: false}},
    board_ref: {view_type: BoardView, presenter_types: [], view_options: {schematic: false}},
    controls: {view_type: MonkeyView, presenter_types: []},
    testkit: {view_type: TestkitView, presenter_types: []},
}