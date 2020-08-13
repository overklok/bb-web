import BoardView from "../../views/board/BoardView";
import BlocklyView from "../../views/blockly/BlocklyView";

export default {
    board_disp: {view_type: BoardView, presenter_types: [], view_options: {schematic: false, readonly: false}},
    board_ref: {view_type: BoardView, presenter_types: [], view_options: {schematic: false}},
    blockly: {view_type: BlocklyView, presenter_types: []}
}