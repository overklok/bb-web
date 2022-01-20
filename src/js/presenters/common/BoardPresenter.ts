import Presenter, {on, restore} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel, {
    ElectronicEvent,
    BoardOptionsEvent,
    PlateEvent,
    BoardAnalogResetEvent
} from "../../models/common/BoardModel";
import CodeModel from "../../models/common/CodeModel";
import SettingsModel, { SettingsChangeEvent } from "../../core/models/SettingsModel";

export default class BoardPresenter extends Presenter<BoardView.BoardView> {
    private code: CodeModel;
    private board: BoardModel;
    settings: SettingsModel;

    public getInitialProps() {
        this.code = this.getModel(CodeModel);
        this.board = this.getModel(BoardModel);
        this.settings = this.getModel(SettingsModel);

        const board_state = this.board.getState();

        const is_demo = this.settings.getBoolean('general.is_demo');
        const ro_by_state = board_state.is_editable && board_state.is_passive;

        return {
            layouts: BoardModel.Layouts,
            layout_name: board_state.layout_name,
            readonly: !is_demo && ro_by_state,
            verbose: this.settings.getBoolean('board.is_verbose'),
            debug: this.settings.getBoolean('board.is_debug'),
        };
    }

    @restore() @on(SettingsChangeEvent)
    private updateSettingsChange() {
        this.board.setPassive(this.settings.getBoolean('general.is_demo', true));
        this.view.setVerbose(this.settings.getBoolean('board.is_verbose', true));
        this.view.setDebug(this.settings.getBoolean('board.is_debug', true));
    }

    @on(BoardView.LayoutChangeEvent)
    private onLayoutChange(evt: BoardView.LayoutChangeEvent) {
        this.board.setBoardLayout(evt.layout_name);
    }
    
    @on(BoardView.BoardChangeEvent)
    private onUserChange(evt: BoardView.BoardChangeEvent) {
        this.board.setUserPlates(evt.plates);
    }

    @restore() @on(BoardOptionsEvent)
    private onOptionsChange(evt: BoardOptionsEvent) {
        this.view.setReadOnly(evt.readonly);
    }

    @restore() @on(PlateEvent)
    private onplates(evt: PlateEvent) {
        console.log(evt);
        
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