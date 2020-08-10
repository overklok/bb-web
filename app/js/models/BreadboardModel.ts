import AsynchronousModel, {connect, disconnect, listen, timeout} from "../core/base/model/AsynchronousModel";
import {ModelState} from "../core/base/model/Model";

type Plate = {
    id: number;
    type: string;
    orientation: string;
    x: number,
    y: number,
}

type Current = {
    from: number;
    to: number;
}

interface BreadboardModelState extends ModelState {
    plates: Plate[];
    currents: Current[];
}

enum Channels {
    Plates = 'plates',
    Currents = 'currents'
}

export default class BreadboardModel extends AsynchronousModel<BreadboardModelState> {
    sendPlates(): void {
        this.send(Channels.Plates, this.state.plates);
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

    @listen(Channels.Plates)
    private onPlates(plates: Plate[]) {
        this.state.plates = plates;
        console.log(plates);
    }

    @listen(Channels.Currents)
    private onCurrents(currents: Current[]) {
        this.state.currents = currents;
        console.log(currents);
    }
}