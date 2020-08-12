import AsynchronousModel, {connect, disconnect, listen} from "../../core/base/model/AsynchronousModel";

type Connection = {
    is_active: boolean;
}

export default class ConnectionModel extends AsynchronousModel<Connection> {
    protected defaultState(): Connection {
        return {
            is_active: false
        }
    }

    @connect()
    private onConnect() {
        this.setState({is_active: true});
    }

    @disconnect()
    private onDisconnect() {
        this.setState({is_active: false});
    }

    @listen('client_swap')
    private onServerLeft() {
        console.log('The client was temporarily abandoned by the server.');
        this.setState({is_active: false});
    }
}