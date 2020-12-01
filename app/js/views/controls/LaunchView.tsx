import * as React from "react";
import classNames from "classnames";
import {AllProps, IViewProps, IViewState, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require('../../../css/blocks/generic/btn.less')
require('../../../css/blocks/fabdesk.less')

interface LaunchViewState extends IViewState {
    is_locked: boolean;
    is_launching: boolean;
}

export class LaunchClickEvent extends ViewEvent<LaunchClickEvent> {
    start: boolean;
}

export default class LaunchView extends View<IViewProps, LaunchViewState> {
    constructor(props: AllProps<IViewProps>) {
        super(props);

        this.state = {
            is_locked: false,
            is_launching: false,
        }
    }

    public setLocked(is_locked: boolean) {
        this.setState({is_locked});
    }

    public setLaunching(is_launching: boolean) {
        this.setState({is_launching});
    }

    public render(): React.ReactNode {
        const klasses_btn_launch = classNames({
            'fabdesk__fab': true,
            'btn': true,
            'btn_primary': true,
            'btn_disabled': this.state.is_locked
        });

        return (
            <div className='fabdesk'>
                <div className={klasses_btn_launch} onClick={() => this.onLaunchClick()}>
                    {this.state.is_launching ? 'Остановить' : 'Запустить'}
                </div>
            </div>
        )
    }

    private onLaunchClick() {
        const is_launching = !this.state.is_launching;
        this.emit(new LaunchClickEvent({start: is_launching}));
    }
}