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
export class ServerGreeting {
    version: { core: (number|string)[], app: (number|string)[], comm: (number|string)[] }
    is_editable: boolean;
}

const CHANNEL_ISSUE_REPORT_REQUEST = 'issue_report_request'

export default class ConnectionModel extends AsynchronousModel<Connection> {
    static alias = 'connection';

    protected defaultState: Connection = {is_active: undefined}

    public requestIssueReport(versions: object, message: string = '') {
        this.send(CHANNEL_ISSUE_REPORT_REQUEST, {versions, message})
    }

    @connect()
    private onConnect(greeting: ServerGreeting) {
        this.setState({is_active: true});
        this.emit(new ConnectionStatusEvent({
            status: "connected",
            version: {
                self: greeting.version.app || ['n/a'],
                core: greeting.version.core || ['n/a']
            }
        }));
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
    version?: { self: (string|number)[], core: (string|number)[] };
}

export class IssueReportCompleteEvent extends ModelEvent<IssueReportCompleteEvent> {}