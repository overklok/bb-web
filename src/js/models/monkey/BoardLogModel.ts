import cloneDeep from "lodash/cloneDeep";

import Model from "../../core/base/model/Model";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import {ModelEvent} from "../../core/base/Event";
import { SerializedPlate } from "~/js/utils/breadboard/core/Plate";

export interface IBoardLogEntry {
    rts: number;
    plates?: SerializedPlate[];
    layout_name: string;
    error?: {
        code?: number,
        message?: string
    };
}

export interface IBoardLogGroup {
    ts_start: number;
    entries: IBoardLogEntry[];
}

export interface IBoardLog {
    groups: IBoardLogGroup[];
}

export class BoardLogUpdate extends ModelEvent<BoardLogUpdate> {}

export default class BoardLogModel extends Model<IBoardLog, DummyDatasource> {
    private is_group_finished: boolean = true;

    protected defaultState: IBoardLog = {
        groups: []
    };

    setLog(log: IBoardLog) {
        this.setState(log);
        this.emit(new BoardLogUpdate());
    }

    getLog(): IBoardLog {
        return this.getState();
    }

    getGroup(grp_idx: number): IBoardLogGroup {
        if (grp_idx in this.state.groups ) {
            const grp = this.state.groups[grp_idx]

            return grp;
        }

        throw new RangeError(`Log group ${grp_idx} is not found`);
    }

    finishGroup() {
        this.is_group_finished = true;
    }

    addPlates(plates: SerializedPlate[], layout_name: string) {
        this.createNewGroupIfRequired();

        const idx_grp = this.state.groups.length - 1;
        const grp = this.state.groups[idx_grp];

        grp.entries.push({
            rts: Date.now() - grp.ts_start,
            plates: cloneDeep(plates),
            layout_name: layout_name,
        });

        this.emit(new BoardLogUpdate());
    }

    addError(error: {code?: number, message?: string}) {
        this.createNewGroupIfRequired();

        const idx_grp = this.state.groups.length - 1;
        const grp = this.state.groups[idx_grp];

        grp.entries.push({
            rts: Date.now() - grp.ts_start,
            error: cloneDeep(error),
            layout_name: undefined,
        });

        this.emit(new BoardLogUpdate());
    }

    private createNewGroupIfRequired() {
        if (this.is_group_finished) {
            this.state.groups.push({
                ts_start: Date.now(),
                entries: []
            });

            this.is_group_finished = false;
        }
    }
}