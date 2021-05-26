import AsynchronousModel, {listen} from "../../core/base/model/AsynchronousModel";
import {ModelState} from "../../core/base/model/Model";
import {ModelEvent} from "../../core/base/Event";
import {AsyncDatasourceStatus} from "../../core/base/model/datasources/AsynchronousDatasource";

const BUTTON_CODES_TO_KEYS: {[key: number]: string} = {
    48: "0",    81: "q",    65: "a",    38: "ArrowUp",
    49: "1",    87: "w",    83: "s",    40: "ArrowDown",
    50: "2",    69: "e",    68: "d",    37: "ArrowLeft",
    51: "3",    82: "r",    70: "f",    39: "ArrowRight",
    52: "4",    84: "t",    71: "g",
    53: "5",    89: "y",    72: "h",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
};

// Event channels
const enum ChannelsTo {
    CodeCommandExecuted = 'xcommand',
    CodeTerminated = 'terminate',
    VariableChanged = 'var_change',
}

const enum ChannelsFrom {
    CodeUpdate = 'code-update',
    CodeStop = 'stop',
}

interface CommandChain {
    commands: string[];
    btn: number;    // TODO: Use key (string) instead of code
    pause: number
}

export type CodeChainset = {[key: string]: CommandChain, main: CommandChain};

interface BlocklyModelState extends ModelState {
    chainset: CodeChainset;
    variables: {[name: string]: number|string};
}

export default class CodeModel extends AsynchronousModel<BlocklyModelState> {
    static alias = 'code';

    protected launching: boolean = undefined;

    protected defaultState: BlocklyModelState = {
        chainset: undefined,
        variables: {}
    }

    public isMainChainEmpty() {
        const chainset = this.state.chainset;

        return !chainset || !chainset.main || chainset.main.commands.length === 0;
    }

    public setChainset(chainset: CodeChainset) {
        this.setState({chainset});
    }

    public executeOnce(commands: any) {
        this.send(ChannelsFrom.CodeUpdate, {
            launch: true,
            commands: commands
        });

        this.launching = false;
    }

    public executeMainChain() {
        if (this.launching === true) {
            console.warn('Another program is launching now, skipping');
            return;
        }

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

        this.launching = false;
    }

    public executeButtonHandlerChain(key: string) {
        if (this.launching === true) {
            console.warn('Another program is launching now, skipping');
            return;
        }

        const chainset = this.getState().chainset;
        let chain: CommandChain;

        if (key == null) return;
        if (!chainset) return;

        for (let chain_ of Object.values(chainset)) {
            if (BUTTON_CODES_TO_KEYS[chain_.btn] === key) {
                chain = chain_;
                break;
            }
        }

        if (!chain || chain.commands.length === 0) {
            return;
        }

        this.send(ChannelsFrom.CodeUpdate, {
            launch: false,
            pause: chain.pause,
            commands: chain.commands
        });

        this.launching = false;
    }

    public interruptMainChain() {
        this.send(ChannelsFrom.CodeStop);
    }

    @listen(ChannelsTo.CodeCommandExecuted)
    protected onCommandExecuted(data: CodeCommandDataPackage) {
        this.emit(new CodeCommandExecutedEvent({block_id: data.block_id}));

        if (this.launching === false) {
            this.launching = true;
            this.emit(new CodeLaunchedEvent());
        }
    }

    @listen(ChannelsTo.CodeTerminated)
    protected onCodeTerminated() {
        this.emit(new CodeTerminatedEvent());
        this.launching = undefined;
    }

    @listen(ChannelsTo.VariableChanged)
    protected onVariableChange(data: VariableStateDataPackage) {
        this.state.variables[data.name] = data.value;

        this.emit(new CodeVariableUpdateEvent({name: data.name, value: data.value}));
    }
}

export class CodeLaunchedEvent extends ModelEvent<CodeLaunchedEvent> {}
export class CodeTerminatedEvent extends ModelEvent<CodeTerminatedEvent> {}
export class CodeCommandExecutedEvent extends ModelEvent<CodeCommandExecutedEvent> {
    block_id: string;
}
export class CodeVariableUpdateEvent extends ModelEvent<CodeVariableUpdateEvent> {
    name: string;
    value: string|number;
}

// Event data types
interface CodeCommandDataPackage {
    block_id: string;
}

interface VariableStateDataPackage {
    name: string;
    value: string|number;
}
