import AsynchronousModel, {listen} from "../../core/base/model/AsynchronousModel";
import {ModelState} from "../../core/base/model/Model";
import {ModelEvent} from "../../core/base/Event";
import {PlateDiff, Thread} from "./BoardModel";
import {AsyncDatasourceStatus} from "../../core/base/model/datasources/AsynchronousDatasource";

// Event channels
const enum ChannelsTo {
    CodeCommandExecuted = 'xcommand',
    CodeTerminated = 'terminate'
}

const enum ChannelsFrom {
    CodeUpdate = 'code-update',
    CodeStop = 'stop',
}

interface CommandChain {
    commands: string[];
    btn: string;
    pause: number
}

interface BlocklyModelState extends ModelState {
    chainset: {[key: string]: CommandChain, main: CommandChain};
}

export default class CodeModel extends AsynchronousModel<BlocklyModelState> {
    protected launch_confirmed: boolean = false;

    protected defaultState: BlocklyModelState = {
        chainset: undefined,
    }

    public isMainChainEmpty() {
        const chainset = this.state.chainset;

        return !chainset || !chainset.main;
    }

    public setChainset(chainset: any) {
        this.setState({chainset});
    }

    public executeMainChain() {
        const chainset = this.getState().chainset;

        if (!(this.data_source.status === AsyncDatasourceStatus.Connected)) {
            this.emit(new CodeTerminatedEvent({}));
            return;
        }

        if (!chainset || !chainset.main || chainset.main.commands.length === 0) {
            this.emit(new CodeTerminatedEvent({}));
            return;
        }

        this.send(ChannelsFrom.CodeUpdate, {
            launch: true,
            pause: chainset.main.pause,
            commands: chainset.main.commands
        });

        this.launch_confirmed = false;
    }

    public executeButtonHandlerChain(keycode: string) {
        const chainset = this.getState().chainset;
        let chain: CommandChain;

        if (!chainset) return;

        for (let chain_ of Object.values(chainset)) {
            if (chain_.btn === keycode) {
                chain = chain_;
                break;
            }
        }

        if (!chain || chain.commands.length === 0) {
            return;
        }

        this.send(ChannelsFrom.CodeUpdate, {
            launch: false,
            commands: chain.commands
        });
    }

    public interruptMainChain() {
        this.send(ChannelsFrom.CodeStop);
    }

    @listen(ChannelsTo.CodeCommandExecuted)
    protected onCommandExecuted(data: CodeCommandDataPackage) {
        this.emit(new CodeCommandExecutedEvent({block_id: data.block_id}));

        if (!this.launch_confirmed) {
            this.launch_confirmed = true;
            this.emit(new CodeLaunchedEvent());
        }
    }

    @listen(ChannelsTo.CodeTerminated)
    protected onCodeTerminated() {
        this.emit(new CodeTerminatedEvent());
        this.launch_confirmed = false;
    }
}

export class CodeLaunchedEvent extends ModelEvent<CodeLaunchedEvent> {}
export class CodeTerminatedEvent extends ModelEvent<CodeTerminatedEvent> {}
export class CodeCommandExecutedEvent extends ModelEvent<CodeCommandExecutedEvent> {
    block_id: string;
}

// Event data types
interface CodeCommandDataPackage {
    block_id: string;
}