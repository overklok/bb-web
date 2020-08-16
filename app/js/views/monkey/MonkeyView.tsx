import * as React from "react";
import {IViewOptions, IViewState, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

require('../../../css/button.less')
require('../../../css/monkey.less')

export class ConfigureClick extends ViewEvent<ConfigureClick> {}
export class ApproveClick extends ViewEvent<ApproveClick> {}
export class NocompClick extends ViewEvent<NocompClick> {}
export class DiagClick extends ViewEvent<DiagClick> {}

export default class MonkeyView extends View<IViewOptions, IViewState>{
    render(): React.ReactNode {
        return (
            <div className='monkey'>
                <div className='monkey__btn btn btn-default' onClick={() => this.emit(new ConfigureClick())}>Настроить...</div>
                <div className='monkey__btn btn btn-success' onClick={() => this.emit(new ApproveClick())}>Схема собрана</div>

                <div className='monkey__btn btn btn-danger' onClick={() => this.emit(new NocompClick())}>Не хватает компонентов</div>
                <div className='monkey__btn btn btn-warning' onClick={() => this.emit(new DiagClick())}>Выполнить диагностику</div>
            </div>
        )
    }
}