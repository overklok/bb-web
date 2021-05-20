import * as React from "react";

import "../../../../css/blocks/log/log-group.less";
import "../../../../css/blocks/log/magazine.less";
import classNames from "classnames";
import {IBoardLogEntry} from "../../../models/monkey/BoardLogModel";

export interface IBoardLogEntryProps {
    rts: number;
    plate_count: number;
    error: string|null;
    on_click?: Function;
}

export interface IBoardLogEntryBulletProps extends IBoardLogEntryProps {
    size: number;
}

export interface IBoardLogGroupProps {
    ts_start: number;
    entries: IBoardLogEntry[];
    on_entry_click?: Function;
}

const LogEntryBullet = (props: IBoardLogEntryBulletProps) => {
    const onClick = (e: React.MouseEvent<HTMLLIElement>) => {
        props.on_click && props.on_click(e)
    }

    const klasses = classNames({
        'magazine__bullet': true,
        'magazine__bullet_success': !props.error,
        'magazine__bullet_danger': props.error
    });

    return (
        <li className={klasses}
               style={{width: `${props.size * 100}%`}}
               title={props.error}
               onClick={e => onClick(e)}
        />
    );
}

const LogEntry = (props: IBoardLogEntryProps) => {
    const onClick = (e: React.MouseEvent<HTMLLIElement>) => {
        props.on_click && props.on_click(e)
    }

    const klasses = classNames({
        'log__entry': true,
        'log__entry_success': !props.error,
        'log__entry_danger': props.error
    });

    const datetime = new Date(props.rts),
          time_str = datetime.toLocaleTimeString('ru');

    return (
        <li className={klasses} onClick={e => onClick(e)}>
            {props.error ? 'Ошибка' : 'Плашки'}: {props.error ? props.error : props.plate_count}, {time_str}
        </li>
    );
}

interface ILogGroupState {
    expanded: boolean;
}

export class LogGroup extends React.Component<IBoardLogGroupProps, ILogGroupState> {
    constructor(props: IBoardLogGroupProps) {
        super(props);

        this.state = {
            expanded: false,
        }
    }

    onEntryClick(i: number) {
        this.props.on_entry_click && this.props.on_entry_click(i);
    }

    onExpanderClick() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    render() {
        const sizes = this.props.entries.map(
            (e, i) => i === 0 ? e.rts : e.rts - this.props.entries[i - 1].rts
        );

        const max = Math.max(...sizes),
              sizes_rel = sizes.map(s => s / max),
              has_errors = this.props.entries.some(e => e.error);

        const datetime = new Date(this.props.ts_start),
            time_str = datetime.toLocaleTimeString('ru'),
            date_str = datetime.toLocaleDateString('ru');

        const klasses = classNames({
            'log-group': true,
            'log-group_danger': has_errors
        });

        const klasses_expander = classNames({
            'log-group__expander': true,
            'log-group__expander_active': this.state.expanded
        });

        return (
            <div className={klasses}>
                <div className='log-group__header'>
                    <div className='log-group__headings'>
                        <p className='log-group__heading'>
                            Сборка: {time_str}, {date_str}
                        </p>
                        <p className='log-group__subheading'>
                            Кол-во изменений: {this.props.entries.length}
                        </p>
                    </div>
                    <div className="log-group__controls">
                        <div className={klasses_expander} onClick={() => this.onExpanderClick()}/>
                    </div>
                </div>
                <ul className='log-group__statusbar magazine'>
                    {this.props.entries.map((ent, i) => {
                        let size = sizes_rel[i];
                        size = Number.isNaN(size) ? 1 : size;

                        return <LogEntryBullet key={i}
                                         rts={ent.rts}
                                         plate_count={ent.plates.length}
                                         error={ent.error ? ent.error.message : null}
                                         size={size}
                                         on_click={() => this.onEntryClick(i)}
                        />;
                    })}
                </ul>

                <div className='log-group__details'>
                    {this.state.expanded ?
                        <ul className='log__list'>
                            {this.props.entries.map((ent, i) => {
                                return <LogEntry key={i}
                                                 rts={ent.rts}
                                                 plate_count={ent.plates.length}
                                                 error={ent.error ? ent.error.message : null}
                                                 on_click={() => this.onEntryClick(i)}
                                />;
                            })}
                        </ul>
                       : null
                    }
                </div>
            </div>
        )
    }
}