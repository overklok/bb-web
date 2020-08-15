import * as React from "react";
import {IViewOptions, IViewState, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require('../../../css/button.less')
require('../../../css/monkey.less')

export class ConfigureEvent extends ViewEvent<ConfigureEvent> {}

export default class MonkeyView extends View<IViewOptions, IViewState>{
    onConfigureClick() {
        this.emit(new ConfigureEvent());
    }

    render(): React.ReactNode {
        return (
            <div className='monkey'>
                <div className='btn' onClick={() => this.onConfigureClick()}>Configure Set</div>
            </div>
        )
    }
}