import * as React from "react";
import {IViewOptions, IViewProps, IViewState, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require('../../../css/blocks/btn.less')
require('../../../css/blocks/monkey.less')

export class ConfigureClick extends ViewEvent<ConfigureClick> {}
export class ApproveClick extends ViewEvent<ApproveClick> {}
export class NocompClick extends ViewEvent<NocompClick> {}
export class DiagClick extends ViewEvent<DiagClick> {}

export default class MonkeyView extends View<IViewOptions, IViewState>{
    constructor(p: IViewProps<IViewOptions>) {
        super(p);

        this.state = {
            approve_active: false
        };
    }


    render(): React.ReactNode {
        return (
            <div className='monkey'>
                <div className='monkey__btn btn btn_success' onClick={() => this.emit(new ApproveClick())}>Схема собрана!</div>
                <div className='monkey__btn btn btn_primary' onClick={() => this.emit(new ConfigureClick())}>Настроить...</div>

                <div className='monkey__btn btn btn_danger'  onClick={() => this.emit(new NocompClick())}>Не хватает компонентов</div>
                <div className='monkey__btn btn btn_warning' onClick={() => this.emit(new DiagClick())}>Выполнить диагностику</div>
            </div>
        )
    }
}