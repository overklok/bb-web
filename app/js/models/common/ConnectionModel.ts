import AsynchronousModel, {
    connect,
    disconnect,
    listen,
    timeout,
    waiting
} from "../../core/base/model/AsynchronousModel";
import {ModelEvent} from "../../core/base/Event";

type Connection = {
    is_active: boolean;
}

export default class ConnectionModel extends AsynchronousModel<Connection> {
    static alias = 'connection';

    protected defaultState: Connection = {is_active: false}

    @connect()
    private onConnect() {
        this.setState({is_active: true});
        this.emit(new ConnectionStatusEvent({status: "connected"}));
    }

    @disconnect()
    private onDisconnect() {
        this.setState({is_active: false});
        this.emit(new ConnectionStatusEvent({status: "disconnected"}));
    }

    @listen('client_swap')
    private onServerLeft() {
        console.log('The client was temporarily abandoned by the server.');
        this.setState({is_active: false});
        this.emit(new ConnectionStatusEvent({status: "disconnected"}));
    }

    @timeout()
    private reportTimeout() {
        this.emit(new ConnectionStatusEvent({status: "timeout"}));
    }

    @waiting()
    private reportWaiting() {
        this.emit(new ConnectionStatusEvent({status: 'waiting'}));
    }
}

export class ConnectionStatusEvent extends ModelEvent<ConnectionStatusEvent> {
    status: 'connected' | 'disconnected' | 'waiting' | 'timeout';
}
