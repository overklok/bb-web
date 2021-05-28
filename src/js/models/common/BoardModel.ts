import {layoutToBoardInfo} from "../../utils/breadboard/core/extras/board_info";
import {LAYOUTS as CORE_LAYOUTS} from "../../utils/breadboard/core/extras/layouts";
import {LAYOUTS} from "../../utils/breadboard/extras/layouts";

import {ModelState} from "../../core/base/model/Model";
import {ModelEvent} from "../../core/base/Event";

import AsynchronousModel, {
    listen,
    connect,
} from "../../core/base/model/AsynchronousModel";
import {extractLabeledCells} from "../../utils/breadboard/core/extras/helpers";
import LabelLayer from "../../utils/breadboard/layers/LabelLayer";

// Event channels
const enum ChannelsTo {
    Plates = 'plates',
    BoardLayout = 'board-layout'
}

const enum ChannelsFrom {
    Error = 'error',
    Plates = 'draw_plates',
    Currents = 'draw_currents',
    EditableChanged = 'is_editable',

    BoardConnected = 'board-connect',
    BoardSearching = 'board-search',
    BoardDisconnected = 'board-disconnect',
    BoardLayoutName = 'board-layout-name',
}

interface BreadboardModelState extends ModelState {
    plates: Plate[];
    elements: PlateDiff[];
    threads: Thread[];
    arduino_pins: ArduinoPin[];
    layout_name: string;
    layout_confirmed: boolean;
    snapshot_limit: number;
    snapshot_ttl: number;
    is_connected: boolean;
    is_editable: boolean;
    is_passive: boolean;
}

export default class BoardModel extends AsynchronousModel<BreadboardModelState> {
    static alias = 'board';

    static Layouts: {[key: string]: BoardLayout} = {
        v5x: CORE_LAYOUTS['v5x'],
        v8x: LAYOUTS['v8x']
    };

    protected defaultState: BreadboardModelState = {
        plates: [],
        elements: [],
        threads: [],
        arduino_pins: [],
        layout_name: 'v8x',
        layout_confirmed: false,
        snapshot_limit: 1000,
        snapshot_ttl: 30000, // ms
        is_connected: false,
        is_editable: false,
        is_passive: false
    }

    private last_snapshot_time: number = 0;

    private snapshots: BoardModelSnapshot[] = [];
    private __legacy_onuserchange: Function;

    private saveSnapshot() {
        this.last_snapshot_time = Date.now();
        this.snapshots.push({time: this.last_snapshot_time, data: this.state});

        if (this.snapshots.length > this.state.snapshot_limit) {
            this.snapshots.shift();
        }
    }

    public getSnapshots(): BoardModelSnapshot[] {
        const snapshots = [];

        const last_snapshot_time = this.snapshots[this.snapshots.length - 1].time;

        for (let i = this.snapshots.length - 1; i >= 0; i--) {
            const snapshot = this.snapshots[i];

            if (last_snapshot_time - snapshot.time > this.state.snapshot_ttl) break;

            snapshots.unshift(snapshot);
        }

        return snapshots;
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
    public setUserPlates(plates: Plate[]): void {
        this.setState({plates});
        this.sendPlates(this.state.plates);

        this.emit(new UserPlateEvent({plates}));

        this.__legacy_onuserchange && this.__legacy_onuserchange();
    }

    /**
     * Attach listener for user changes
     *
     * This method is left here to maintain compatibility with legacy apps
     * such as server admin widgets
     *
     * @deprecated
     *
     * @param cb
     */
    public onUserChange(cb: Function) {
        this.__legacy_onuserchange = cb;
    }

    public setPassive(is_passive: boolean) {
        this.setState({is_passive});

        this.emit(new BoardOptionsEvent({
            readonly: this.state.is_editable && this.state.is_passive
        }));
    }
    
    /**
     * Send meta information about the board (incl. layout name and structure)
     */
    @connect()
    private onConnect(data: ServerGreeting) {
        this.setEditable(data.is_editable);

        this.sendCurrentBoardInfo();
    }

    private sendCurrentBoardInfo() {
        const layout_name = this.state.layout_name;

        if (!layout_name) return;

        // disallow board data before confirmation
        this.setState({layout_confirmed: false});
        const board_info = layoutToBoardInfo(BoardModel.Layouts[layout_name]);
        this.send(ChannelsTo.BoardLayout, {layout_name, board_info});
    }

    @listen(ChannelsFrom.BoardConnected)
    private reportConnection() {
        this.setState({is_connected: true});
        this.emit(new BoardStatusEvent({status: 'connected'}));
    }

    @listen(ChannelsFrom.BoardDisconnected)
    private reportDisconnection() {
        this.setState({is_connected: false});
        this.emit(new BoardStatusEvent({status: 'disconnected'}));
    }

    @listen(ChannelsFrom.BoardSearching)
    private reportSearching() {
        this.setState({is_connected: false});
        this.emit(new BoardStatusEvent({status: 'searching'}));
    }

    @listen(ChannelsFrom.EditableChanged)
    private setEditable(is_editable: boolean) {
        this.setState({is_editable});

        this.emit(new BoardOptionsEvent({
            readonly: !this.state.is_editable && !this.state.is_passive
        }));
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
        this.resetAnalog();

        if (this.state.layout_name === layout_name) {
            // confirm board data change
            this.setState({layout_confirmed: true});

            this.sendPlates(this.state.plates);
        }
    }

    /**
     * Receive plate data update from the backend
     *
     * This method verifies the layout currently applied.
     * If you need to force the data you may need to call {@link setPlates} from developer console.
     *
     * @param plates an array of plate data objects
     */
    @listen(ChannelsFrom.Plates)
    private receivePlates(plates: Plate[]) {
        if (!this.state.layout_confirmed) return;

        this.setPlates(plates);
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
    private receiveElectronics({threads, elements, arduino_pins}: ElectronicData) {
        if (!this.state.layout_confirmed) return;

        this.setElectronics({threads, elements, arduino_pins});
    }

    /**
     * Receive error data reported by the backend
     *
     * @param message
     * @param code
     */
    @listen(ChannelsFrom.Error)
    private receiveError({message, code}: ErrorData) {
        this.emit(new BoardErrorEvent({message, code}));
    }

    private sendPlates(plates: Plate[]): void {
        if (this.state.is_editable) {
            this.send(ChannelsTo.Plates, plates);
        }
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
    public setPlates(plates: Plate[]): void {
        this.setState({plates});

        this.saveSnapshot();

        this.emit(new PlateEvent({plates}));
    }

    public setElectronics({threads, elements, arduino_pins}: ElectronicData) {
        this.setState({
            threads: threads,
            elements: elements,
            arduino_pins: arduino_pins,
        });

        this.saveSnapshot();

        this.emit(new ElectronicEvent({threads, elements, arduino_pins}));
    }

    public resetAnalog() {
        console.log('reset analog');

        const layout = BoardModel.Layouts[this.state.layout_name];

        const pins: [number, string|number][] = [];

        for (const cell of extractLabeledCells(layout, LabelLayer.CellRoles.Analog)) {
            pins.push([cell.pin_num, cell.pin_state_initial]);
        }

        this.emit(new BoardAnalogResetEvent({arduino_pins: pins}));
    }
}

// Types
enum PinDirection {Input = 'input', Output = 'output'}
type ArduinoPin = [PinDirection, number];

type BoardModelSnapshot = {
    time: number;
    data: BreadboardModelState;
}


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
    highlight: boolean;
    dynamic: {[key: string]: any};
}

export type Thread = {
    from: number;
    to: number;
}

export type BoardLayout = {
    grid_rows: number;
    grid_cols: number;
    domains: {
        horz: boolean;
        from: {x: number, y: number},
        to: {x: number, y: number},
        pin_state_initial?: any
    }[];
}

// Event data types
interface ElectronicData {
    threads: Thread[];
    elements: PlateDiff[];
    arduino_pins: ArduinoPin[];
}

interface ErrorData {
    code: number, message: string
}

export class ServerGreeting {
    version: string;
    is_editable: boolean;
}

export class UserPlateEvent extends ModelEvent<PlateEvent> {
    plates: Plate[];
}

export class PlateEvent extends ModelEvent<PlateEvent> {
    plates: Plate[];
}

export class ElectronicEvent extends ModelEvent<ElectronicEvent> {
    threads: Thread[];
    elements: PlateDiff[];
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

export class BoardAnalogResetEvent extends ModelEvent<BoardAnalogResetEvent> {
    arduino_pins: [number, string|number][];
}