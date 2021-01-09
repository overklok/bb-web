import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {ColorAccent} from "../../helpers/styles";
import {Toast} from "./Toast";

require("../../../../css/core/alert.less");


export interface IToast {
    title?: string;
    content?: string;
    status: ColorAccent;
    timeout?: number;
}

interface AlertViewProps extends IViewState {
    toasts: IToast[];
    on_close?: (idx: number) => void;
}

export default class AlertView extends View<AlertViewProps, null> {
    static defaultProps: AlertViewProps = {
        toasts: []
    }

    constructor(props: AllProps<AlertViewProps>) {
        super(props);
    }

    handleToastClose(idx: number) {
        this.props.on_close && this.props.on_close(idx);
    }

    render(): React.ReactNode {
        const klass_names = {enter: 'toast_hidden', exit: 'toast_hidden toast_collapsed'};

        return (
            <TransitionGroup className='alert'>
                {this.props.toasts.map((toast, i) => !toast ? null : (
                    <CSSTransition key={i} timeout={200} classNames={klass_names}>
                        <Toast index={i}
                               status={toast.status}
                               title={toast.title}
                               timeout={toast.timeout}
                               on_close={() => this.handleToastClose(i)}>
                            {toast.content}
                        </Toast>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        )
    }
}