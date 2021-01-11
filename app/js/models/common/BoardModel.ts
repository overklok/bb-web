import {layoutToBoardInfo} from "../../utils/breadboard/core/extras/board_info";
import {LAYOUTS as CORE_LAYOUTS} from "../../utils/breadboard/core/extras/layouts";
import {LAYOUTS} from "../../utils/breadboard/extras/layouts";

import {ModelState} from "../../core/base/model/Model";
import {ModelEvent} from "../../core/base/Event";

import AsynchronousModel, {
    listen,
    connect,
    disconnect,
    timeout,
    waiting
} from "../../core/base/model/AsynchronousModel";

// Event channels
const enum ChannelsTo {
    Plates = 'plates',
    BoardLayout = 'board-layout'
}

const enum ChannelsFrom {
    Error = 'error',
    Plates = 'draw_plates',
    Currents = 'draw_currents',
    BoardConnected = 'board-connect',
    BoardSearching = 'board-search',
    BoardDisconnected = 'board-disconnect',
    BoardLayoutName = 'board-layout-name',
}

interface BreadboardModelState extends ModelState {
    plates: Plate[];
    threads: Thread[];
    arduino_pins: ArduinoPin[];
    layout_name: string;
    layout_confirmed: boolean;
}

export default class BoardModel extends AsynchronousModel<BreadboardModelState> {
    static Layouts: {[key: string]: BoardLayout} = {
        v5x: CORE_LAYOUTS['v5x'],
        v8x: LAYOUTS['v8x']
    };

    protected defaultState: BreadboardModelState = {
        plates: [],
        threads: [],
        arduino_pins: [],
        layout_name: 'v8x',
        layout_confirmed: false,
    }

    /**
     * Set board layout (structure and visual options) by layout name
     *
     * @param layout_name
     */
    public setBoardLayout(layout_name: string): void {
        if (!layout_name) return;

        if (this.state.layout_name != layout_name) {
            this.setState({layout_name});
            this.emit(new BoardLayoutEvent({layout_name}));
            this.sendCurrentBoardInfo();
        }
    }

    /**
     * Get board layout currently applied to the board
     */
    public getBoardLayout(): string {
        return this.state.layout_name;
    }

    /**
     * Set plates defined by the client via editor
     *
     * @param plates
     */
    public setPlates(plates: Plate[]): void {
        this.setState({plates});
        this.send(ChannelsTo.Plates, plates);
        this.emit(new UserPlateEvent({plates}));
    }

    /**
     * Switch admin mode (used for external apps)
     *
     * TODO: This function is here just for compatibility with older edition of JS code,
     *       and it should be removed after finishing migration to TypeScript edition
     *       and replaced with more native approach.
     *
     * @param is_admin
     */
    public setAdminMode(is_admin: boolean) {
        this.emit(new BoardOptionsEvent({readonly: !is_admin}))
    }

    /**
     * Send meta information about the board (incl. layout name and structure)
     */
    @connect()
    private sendCurrentBoardInfo() {
        const layout_name = this.getState().layout_name;

        if (!layout_name) return;

        // disallow board data before confirmation
        this.setState({layout_confirmed: false});
        const board_info = layoutToBoardInfo(BoardModel.Layouts[layout_name]);
        this.send(ChannelsTo.BoardLayout, {layout_name, board_info});

        // this.emit(new BoardStatusEvent({status: 'connected'}));
    }

    @listen(ChannelsFrom.BoardConnected)
    private reportConnection() {
        this.emit(new BoardStatusEvent({status: 'connected'}));
    }

    @listen(ChannelsFrom.BoardDisconnected)
    private reportDisconnection() {
        this.emit(new BoardStatusEvent({status: 'disconnected'}));
    }

    @listen(ChannelsFrom.BoardSearching)
    private reportSearching() {
        this.emit(new BoardStatusEvent({status: 'searching'}));
    }

    /**
     * Receive board layout name to update the visual configuration and
     * to validate new data packages correctly
     *
     * This handler calls usually after {@link sendCurrentBoardInfo} request
     * to verify successful layout switch on the backend.
     *
     * @param layout_name
     */
    @listen(ChannelsFrom.BoardLayoutName)
    private receiveBoardLayoutName(layout_name: string) {
        if (this.state.layout_name === layout_name) {
            // confirm board data change
            this.setState({layout_confirmed: true});
            this.send(ChannelsTo.Plates, this.state.plates);
        }
    }

    /**
     * Receive plate data update from the backend
     *
     * This method verifies the layout currently applied.
     * If you need to force the data you may need to call {@link acceptPlates} from developer console.
     *
     * @param plates an array of plate data objects
     */
    @listen(ChannelsFrom.Plates)
    private receivePlates(plates: Plate[]) {
        if (!this.state.layout_confirmed) return;

        this.acceptPlates(plates);
    }

    /**
     * Receive electronic data update from the backend
     *
     * This method verifies the layout currently applied.
     *
     * @param threads       data objects describing current parts
     * @param elements      data objects describing electronic props of plates mounted currently on the board
     * @param arduino_pins  data objects describing state of Arduino pins
     */
    @listen(ChannelsFrom.Currents)
    private receiveElectronics({threads, elements, arduino_pins}: ElectronicDataPackage) {
        if (!this.state.layout_confirmed) return;

        this.setState({
            threads: threads,
            arduino_pins: arduino_pins,
        });

        this.emit(new ElectronicEvent({threads, elements, arduino_pins}));
    }

    /**
     * Receive error data reported by the backend
     *
     * @param message
     * @param code
     */
    @listen(ChannelsFrom.Error)
    private receiveError({message, code}: ErrorDataPackage) {
        this.emit(new BoardErrorEvent({message, code}));
    }

    /**
     * Accept incoming plates from backend
     *
     * This method may be useful when debugging.
     * Call it manually if you need to reproduce the situation when the model
     * receives plates from the backend.
     *
     * @param plates
     */
    private acceptPlates(plates: Plate[]): void {
        this.setState({plates});

        this.emit(new PlateEvent({plates}));
    }
}

// Types
enum PinDirection {Input = 'input', Output = 'output'}
type ArduinoPin = [PinDirection, number];


export type Plate = {
    id: number;
    type: string;
    orientation: string;
    x: number;
    y: number;
    extra: string|number;
}

export type PlateDiff = {
    id: number;
    highlighted: boolean;
}

export type Thread = {
    from: number;
    to: number;
}

export type BoardLayout = {
    grid_rows: number;
    grid_cols: number;
}

// Event data types
interface ElectronicDataPackage {
    threads: Thread[], elements: PlateDiff[], arduino_pins: ArduinoPin[]
}

interface ErrorDataPackage {
    code: number, message: string
}

export class UserPlateEvent extends ModelEvent<PlateEvent> {
    plates: Plate[];
}

export class PlateEvent extends ModelEvent<PlateEvent> {
    plates: Plate[];
}

export class ElectronicEvent extends ModelEvent<ElectronicEvent> {
    threads: Thread[];
    arduino_pins: ArduinoPin[];
}

export class BoardErrorEvent extends ModelEvent<BoardErrorEvent> {
    code: number;
    message: string;
}

export class BoardOptionsEvent extends ModelEvent<BoardOptionsEvent> {
    readonly: boolean;
}

export class BoardLayoutEvent extends ModelEvent<BoardLayoutEvent> {
    layout_name: string;
}

export class BoardStatusEvent extends ModelEvent<BoardStatusEvent> {
    status: 'connected' | 'disconnected' | 'searching';
}