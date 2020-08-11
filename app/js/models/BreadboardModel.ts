import AsynchronousModel, {connect, disconnect, listen, timeout} from "../core/base/model/AsynchronousModel";
import {ModelState} from "../core/base/model/Model";
import AsynchronousDatasource from "../core/base/model/datasources/AsynchronousDatasource";
import IEventService from "../core/services/interfaces/IEventService";
import {AbstractEvent, ModelEvent} from "../core/base/Event";

// Types
enum PinDirection {Input = 'input', Output = 'output'}
type ArduinoPin = [PinDirection, number];

type Plate = {
    id: number;
    type: string;
    orientation: string;
    x: number,
    y: number,
}

type PlateDiff = {
    id: number;
    highlighted: boolean;
}

type Thread = {
    from: number;
    to: number;
}

interface BreadboardModelState extends ModelState {
    plates: Plate[];
    threads: Thread[];
    arduino_pins: ArduinoPin[];
}

// Event channels
enum ChannelsTo {
    Plates = 'plates',
}

enum ChannelsFrom {
    Plates = 'draw_plates',
    Currents = 'draw_currents'
}

// Event data types
interface ElectronicDataPackage {
    threads: Thread[], elements: PlateDiff[], arduino_pins: ArduinoPin[]
}

export class ElectronicEvent extends ModelEvent<ElectronicEvent> {
    threads: Thread[];
    arduino_pins: ArduinoPin[];
}

export default class BreadboardModel extends AsynchronousModel<BreadboardModelState> {
    protected defaultState(): BreadboardModelState {
        return {
            plates: [],
            threads: [],
            arduino_pins: []
        };
    }

    constructor(data_source: AsynchronousDatasource, svc_event: IEventService) {
        super(data_source, svc_event);
    }

    sendPlates(plates: Plate[]): void {
        this.state.plates = plates;
        this.send(ChannelsTo.Plates, plates);
    }

    @connect()
    private onConnect() {
        console.log('Breadboard connected');
    }

    @disconnect()
    private onDisconnect() {
        console.log('Breadboard disconnected');
    }

    @timeout()
    private onTimeout() {
        console.log('Breadboard timeout');
    }

    @listen(ChannelsFrom.Plates)
    private onPlates(plates: Plate[]) {
        this.state.plates = plates;
        console.log(plates);
    }

    @listen(ChannelsFrom.Currents)
    private onCurrents({threads, elements, arduino_pins}: ElectronicDataPackage) {
        this.setState({
            threads: threads,
            arduino_pins: arduino_pins
        });

        this.emit(new ElectronicEvent({threads, elements, arduino_pins}))
    }
}