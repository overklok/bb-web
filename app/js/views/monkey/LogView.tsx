import * as React from "react";
import {IViewOptions, IViewProps, IViewState, View} from "../../core/base/view/View";
import {LogGroup} from "./log/LogGroup";

import "../../../css/blocks/log.less"
import {IBoardLog, IBoardLogEntry, IBoardLogGroup} from "../../models/monkey/BoardLogModel";
import {ViewEvent} from "../../core/base/Event";

interface IBoardLogState extends IViewState {
    groups: IBoardLogGroup[];
}

export class LogEntryClickEvent extends ViewEvent<LogEntryClickEvent> {
    grp_idx: number;
    ent_idx: number;
}

export default class LogView extends View<IViewOptions, IBoardLogState> {
    constructor(props: IViewProps<IViewOptions>) {
        super(props);

        this.state = {
            groups: []
        }
    }

    public setLog(log: IBoardLog) {
        const grps: IBoardLogGroup[] = [];

        for (const group of log.groups) {
            const ents: IBoardLogEntry[] = [];

            for (const entry of group.entries) {
                ents.push({
                    rts: entry.rts,
                    plates: entry.plates,
                    error: entry.error,
                    layout_name: entry.layout_name
                })
            }

            grps.push({
                ts_start: group.ts_start,
                entries: ents
            });
        }

        this.setState({
            groups: grps
        });
    }

    public render(): React.ReactNode {
        return (
            <div className='log'>
                <ul className="log__list">
                    {this.state.groups.reverse().map((grp, i) => {
                        return <li key={i} className='log__item'>
                            <LogGroup ts_start={grp.ts_start}
                                      entries={grp.entries}
                                      on_entry_click={(evt_idx: number) =>
                                          this.onEntryClick(this.state.groups.length-i - 1, evt_idx)
                                      }
                            />
                        </li>
                    })}
                </ul>
            </div>
        )
    }

    private onEntryClick(grp_idx: number, ent_idx: number) {
        this.emit(new LogEntryClickEvent({grp_idx, ent_idx}));
    }
}