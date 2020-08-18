import * as React from "react";
import {IViewOptions, IViewProps, IViewState, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";
import classNames from "classnames";

require('../../../css/button.less')
require('../../../css/monkey.less')

export class ConfigureClick extends ViewEvent<ConfigureClick> {}
export class ApproveClick extends ViewEvent<ApproveClick> {}
export class NocompClick extends ViewEvent<NocompClick> {}
export class DiagClick extends ViewEvent<DiagClick> {}

interface MonkeyViewState extends IViewState {
    approve_active: boolean;
}

export default class MonkeyView extends View<IViewOptions, MonkeyViewState>{
    constructor(p: IViewProps<IViewOptions>) {
        super(p);

        this.state = {
            approve_active: false
        };
    }

    setApproveActive(is_active: boolean) {
        this.setState({
            approve_active: is_active
        });
    }

    render(): React.ReactNode {
        const klasses_btn_approve = classNames({
            'monkey__btn': true,
            'btn': true,
            'btn_success': true,
            'btn_disabled': !this.state.approve_active
        });

        return (
            <div className='monkey'>
                <div className='monkey__btn btn btn_default' onClick={() => this.emit(new ConfigureClick())}>Настроить...</div>
                <div className={klasses_btn_approve} onClick={() => this.emit(new ApproveClick())}>Схема собрана</div>

                <div className='monkey__btn btn btn_danger' onClick={() => this.emit(new NocompClick())}>Не хватает компонентов</div>
                <div className='monkey__btn btn btn_warning' onClick={() => this.emit(new DiagClick())}>Выполнить диагностику</div>
            </div>
        )
    }
}