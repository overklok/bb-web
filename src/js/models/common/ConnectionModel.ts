import AsynchronousModel, {
    connect,
    disconnect,
    listen,
    timeout,
    waiting
} from "../../core/base/model/AsynchronousModel";
import {ModelEvent} from "../../core/base/Event";
import { textChangeRangeIsUnchanged } from "typescript";

type Connection = {
    is_active: boolean;
}
export class ServerGreeting {
    version: { core: (number|string)[], comm: (number|string)[] };
    app_details: { version: (number|string)[], version_skip: string };
    
    is_editable: boolean;
}

const CHANNEL_APP_COMMAND = 'app_command'
const COMMAND_ISSUE_REPORT_REQUEST = 'issue_report_request'
const COMMAND_LOG_DOWNLOAD_REQUEST = 'log_download_request'
const COMMAND_SAVE_LANGUAGE = 'save_language'
const COMMAND_SKIP_VERSION = 'skip_version'

export default class ConnectionModel extends AsynchronousModel<Connection> {
    static alias = 'connection';

    protected defaultState: Connection = {is_active: undefined}
    private lang: string;

    public requestSaveLanguage(lang: string) {
        this.lang = lang;
        this.send(CHANNEL_APP_COMMAND, { command: COMMAND_SAVE_LANGUAGE, data: { lang } });
    }

    public requestIssueReport(versions: object, message: string = '') {
        this.send(CHANNEL_APP_COMMAND, { command: COMMAND_ISSUE_REPORT_REQUEST, data: { versions, message } });
    }

    public requestLogDownload() {
        this.send(CHANNEL_APP_COMMAND, { command: COMMAND_LOG_DOWNLOAD_REQUEST });
    }

    public requestSkipVersion(version: string) {
        this.send(CHANNEL_APP_COMMAND, { command: COMMAND_SKIP_VERSION, data: { version } });
    }

    @connect()
    private onConnect(greeting: ServerGreeting) {
        const app_details = greeting.app_details || { version: null, version_skip: null };

        this.setState({is_active: true});
        this.emit(new ConnectionStatusEvent({
            status: "connected",
            version: {
                self: app_details.version || ['n/a'],
                core: greeting.version.core || ['n/a']
            },
            version_skip: {
                self: app_details.version_skip || 'n/a'
            }
        }));

        if (this.lang) {
            // request to ensure if previous request failed
            this.requestSaveLanguage(this.lang);
        }
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
    version_skip?: { self: string }
}

export class IssueReportCompleteEvent extends ModelEvent<IssueReportCompleteEvent> {}