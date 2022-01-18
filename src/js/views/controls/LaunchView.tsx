import * as React from "react";
import classNames from "classnames";
import {AllProps, IViewProps, View} from "../../core/base/view/View";
import {ViewEvent} from "../../core/base/Event";

import i18next from 'i18next';

require('../../../css/blocks/generic/btn.less')
require('../../../css/blocks/fabdesk.less')


namespace LaunchView {
    export const enum Mode {
        None,
        CheckOnly,
        ExecuteOnly,
        SkipOnly,
        CheckOrExecute,
        CheckAndExecute,
        SkipAndExecute,
    }

    export const enum ButtonState {
        Idle,
        Busy,
        Running
    }

    export interface Props extends IViewProps {
        mode: Mode;
        is_checking: ButtonState;
        is_executing: ButtonState;
    }

    export class ExecuteClickEvent extends ViewEvent<ExecuteClickEvent> {
        start: boolean;
    }

    export class CheckClickEvent extends ViewEvent<CheckClickEvent> {
        start: boolean;
    }

    export class SkipClickEvent extends ViewEvent<SkipClickEvent> {}

    export class LaunchView extends View<Props, undefined> {
        static defaultProps = {
            mode: Mode.ExecuteOnly,
            is_checking: ButtonState.Idle,
            is_executing: ButtonState.Idle
        }

        constructor(props: AllProps<Props>) {
            super(props);
        }

        private handleExecuteClick() {
            this.emit(new ExecuteClickEvent({start: !this.props.is_executing}));
        }

        private handleCheckClick() {
            this.emit(new CheckClickEvent({start: !this.props.is_checking}));
        }

        private handleSkipClick() {
            this.emit(new SkipClickEvent());
        }

        public render(): React.ReactNode {
            switch (this.props.mode) {
                case Mode.None:            return null;
                case Mode.CheckOnly:       return this.renderCheck();
                case Mode.ExecuteOnly:     return this.renderExecute();
                case Mode.SkipOnly:        return this.renderSkip();
                case Mode.CheckOrExecute:  return this.renderCheckAndExecute();
                case Mode.CheckAndExecute: return this.renderExecute();
                case Mode.SkipAndExecute:  return this.renderSkipAndExecute();
            }
        }

        private renderExecute() {
            const klasses_btn_execute = classNames({
                'btn': true,
                'btn_primary': true,
                'btn_disabled': this.props.is_executing === ButtonState.Busy,
                'fabdesk__fab': true
            });

            return (
                <div className='fabdesk'>
                    <div className={klasses_btn_execute} onClick={() => this.handleExecuteClick()}>
                        {this.props.is_executing ? i18next.t('main:lesson.fabs.stop') : i18next.t('main:lesson.fabs.start')}
                    </div>
                </div>
            )
        }

        private renderCheck() {
            const klasses_btn_check = classNames({
                'btn': true,
                'btn_primary': true,
                'btn_disabled': this.props.is_checking === ButtonState.Busy,
                'fabdesk__fab': true
            });

            return (
                <div className='fabdesk'>
                    <div className={klasses_btn_check} onClick={() => this.handleCheckClick()}>
                        {this.props.is_executing ? i18next.t('main:lesson.fabs.checking') : i18next.t('main:lesson.fabs.check')}
                    </div>
                </div>
            )
        }

        private renderSkip() {
            const klasses_btn_skip = classNames({
                'btn': true,
                'btn_primary': true,
                'fabdesk__fab': true
            });

            return (
                <div className='fabdesk'>
                    <div className={klasses_btn_skip} onClick={() => this.handleSkipClick()}>
                        {i18next.t('main:lesson.fabs.skip')}
                    </div>
                </div>
            )
        }

        private renderSkipAndExecute() {
            const klasses_btn_skip = classNames({
                'btn': true,
                'btn_primary': true,
                'fabdesk__fab': true
            });

            const klasses_btn_execute = classNames({
                'btn': true,
                'btn_primary': true,
                'btn_disabled': this.props.is_executing === ButtonState.Busy,
                'fabdesk__fab': true
            });

            return (
                <div className='fabdesk'>
                    <div className={klasses_btn_skip} onClick={() => this.handleSkipClick()}>
                        {i18next.t('main:lesson.fabs.skip')}
                    </div>
                    <div className={klasses_btn_execute} onClick={() => this.handleExecuteClick()}>
                        {this.props.is_executing ? i18next.t('main:lesson.fabs.stop') : i18next.t('main:lesson.fabs.start')}
                    </div>
                </div>
            )
        }


        private renderCheckAndExecute() {
            const klasses_btn_check = classNames({
                'btn': true,
                'btn_primary': true,
                'btn_disabled': this.props.is_checking === ButtonState.Busy,
                'fabdesk__fab': true
            });

            const klasses_btn_execute = classNames({
                'btn': true,
                'btn_primary': true,
                'btn_disabled': this.props.is_executing === ButtonState.Busy,
                'fabdesk__fab': true
            });

            return (
                <div className='fabdesk'>
                    <div className={klasses_btn_execute} onClick={() => this.handleExecuteClick()}>
                        {this.props.is_executing ? i18next.t('main:lesson.fabs.stop') : i18next.t('main:lesson.fabs.start')}
                    </div>
                    <div className={klasses_btn_check} onClick={() => this.handleCheckClick()}>
                        {this.props.is_checking ? i18next.t('main:lesson.fabs.checking') : i18next.t('main:lesson.fabs.check')}
                    </div>
                </div>
            )
        }
    }
}

export default LaunchView;