import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {ColorAccent, ToastPosition} from "../../helpers/styles";
import {Toast} from "./Toast";

require("css/core/toaster.less");

export interface IToast {
    idx: number;
    title?: string;
    content?: string;
    status: ColorAccent;
    timeout?: number;
    position?: ToastPosition;
    action?: {title: string, callback: Function};
}

interface ToastViewProps extends IViewState {
    toasts: IToast[];
    on_close?: (idx: number) => void;
}

/**
 * Determine whether can be displayed at specified position
 *
 * @param toast     the toast going to be filtered
 * @param position  the position specified to display the toast
 */
const filterToast = (toast: IToast, position: ToastPosition) => {
    if (!toast) return false;

    // show toast if its position corresponds with specified
    // if no position is specified in the toast, show it at the default position (`BottomRight`)
    return toast.position == position || !toast.position && position == ToastPosition.BottomRight;
}

export default class ToastView extends View<ToastViewProps, null> {
    static defaultProps: ToastViewProps = {
        toasts: [],
    }

    handleToastClose(idx: number) {
        this.props.on_close && this.props.on_close(idx);
    }

    render(): React.ReactNode {
        const klass_names = {enter: 'toast_hidden', exit: 'toast_hidden toast_collapsed'};

        return Object.values(ToastPosition).map((pos: ToastPosition) => (
            <TransitionGroup className={`toaster toaster_${pos}`} key={pos}>
                {this.props.toasts.filter(t => filterToast(t, pos)).map((toast, i) => (
                    <CSSTransition key={toast.idx} timeout={200} classNames={klass_names}>
                        <Toast index={toast.idx}
                               status={toast.status}
                               title={toast.title}
                               timeout={toast.timeout}
                               action={toast.action}
                               on_close={() => this.handleToastClose(toast.idx)}>
                            {toast.content}
                        </Toast>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        ))
    }
}