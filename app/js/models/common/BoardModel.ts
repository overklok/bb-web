import {LAYOUTS as CORE_LAYOUTS} from "../../utils/breadboard/core/extras/layouts";
import {LAYOUTS} from "../../utils/breadboard/extras/layouts";

import AsynchronousModel, {listen} from "../../core/base/model/AsynchronousModel";
import {ModelState} from "../../core/base/model/Model";
import {ModelEvent} from "../../core/base/Event";

// Event channels
const enum ChannelsTo {
    Plates = 'plates',
}

const enum ChannelsFrom {
    Error = 'error',
    Plates = 'draw_plates',
    Currents = 'draw_currents',
}

interface BreadboardModelState extends ModelState {
    plates: Plate[];
    threads: Thread[];
    arduino_pins: ArduinoPin[];
    layout_name: string;
}

export default class BoardModel extends AsynchronousModel<BreadboardModelState> {
    static Layouts: {[key: string]: BoardLayout} = {
        default: CORE_LAYOUTS['default'],
        v8x: LAYOUTS['v8x']
    };

    protected defaultState: BreadboardModelState = {
        plates: [],
        threads: [],
        arduino_pins: [],
        layout_name: 'default',
    }

    setBoardLayout(layout_name: string): void {
        if (!layout_name) return;

        if (this.state.layout_name != layout_name) {
            this.setState({layout_name});
            this.emit(new BoardLayoutEvent({layout_name}));
        }
    }

    getBoardLayout(): string {
        return this.state.layout_name;
    }

    setPlates(plates: Plate[]): void {
        this.setState({plates});
        this.send(ChannelsTo.Plates, plates);
        this.emit(new UserPlateEvent({plates}));
    }

    /**
     * Switch admin mode (used for external apps)
     *
     * TODO: This function is here just for compatibility with older edition of JS code
     *       and it should be removed after finishing migration to TypeScript edition
     *       and replaced with more native approach.
     *
     * @param is_admin
     */
    setAdminMode(is_admin: boolean) {
        this.emit(new BoardOptionsEvent({readonly: !is_admin}))
    }

    @listen(ChannelsFrom.Plates)
    private onPlates(plates: Plate[]) {
        this.setState({
            plates
        });

        this.emit(new PlateEvent({plates}));
    }

    @listen(ChannelsFrom.Currents)
    private onCurrents({threads, elements, arduino_pins}: ElectronicDataPackage) {
        this.setState({
            threads: threads,
            arduino_pins: arduino_pins
        });

        this.emit(new ElectronicEvent({threads, elements, arduino_pins}));
    }

    @listen(ChannelsFrom.Error)
    private onError({message, code}: ErrorDataPackage) {
        this.emit(new BoardErrorEvent({message, code}));
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