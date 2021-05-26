import Presenter, {on, restore} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel, {
    ElectronicEvent,
    BoardOptionsEvent,
    PlateEvent,
    BoardAnalogResetEvent
} from "../../models/common/BoardModel";
import CodeModel from "../../models/common/CodeModel";

export default class BoardPresenter extends Presenter<BoardView.BoardView> {
    private code: CodeModel;
    private board: BoardModel;

    public getInitialProps() {
        this.code = this.getModel(CodeModel);
        this.board = this.getModel(BoardModel);

        const board_state = this.board.getState();

        return {
            layouts: BoardModel.Layouts,
            layout_name: board_state.layout_name,
            readonly: board_state.is_editable && board_state.is_passive
        }
    }

    @on(BoardView.LayoutChangeEvent)
    private onLayoutChange() {
        this.board.setBoardLayout(this.view.getLayoutName());
    }
    
    @on(BoardView.BoardChangeEvent)
    private onUserChange() {
        this.board.setUserPlates(this.view.getPlates());
    }

    @restore() @on(BoardOptionsEvent)
    private onOptionsChange(evt: BoardOptionsEvent) {
        this.view.setReadOnly(evt.readonly);
    }

    @restore() @on(PlateEvent)
    private onplates(evt: PlateEvent) {
        this.view.setPlates(evt.plates);
    }

    @restore() @on(ElectronicEvent)
    private onelec(evt: ElectronicEvent) {
        this.view.setCurrents(evt.threads);
        this.view.setPinsValues(evt.arduino_pins);

        for (const element of evt.elements) {
            this.view.setPlateState(element.id, {
                ...element.dynamic,
                highlighted: element.highlight
            });
        }
    }

    @restore() @on(BoardAnalogResetEvent)
    private resetArduinoPins(evt: BoardAnalogResetEvent) {
        const commands = [];

        for (const [pin_num, pin_val] of evt.arduino_pins) {
            let cmd = 'arduino_out_write_pwm',
                val =  pin_val;

            if (typeof(pin_val) === 'string') {
                cmd = 'arduino_out_write_logical';
                val = pin_val === 'input' ? 1 : 0;
            }

            commands.push({
                name: cmd,
                block_id: null,
                args: [
                    {type: "expression", value: String(pin_num)},
                    {type: "number", value: val}
                ]
            });
        }

        this.code.executeOnce(commands);
    }
}