import * as React from "react";

import {AllProps, IViewProps, IViewState, View} from "../base/view/View";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {ColorAccent, ToastPosition} from "../helpers/styles";
import Toast from "./toast/Toast";

require("css/core/cornfield.less");
require("css/core/toaster.less");

/**
 * Data object for Toast
 * 
 * Prototype for {@link Toast}
 * 
 * @category Core.Views
 * @subcategory DataObjects
 */
export interface IToast {
    idx: number;
    title?: string;
    content?: string;
    status: ColorAccent;
    timeout?: number;
    position?: ToastPosition;
    action?: {title: string, callback: Function};
}

/**
 * Props for {@link ToastView}
 * 
 * @category Core.Views
 */
interface ToastViewProps extends IViewState {
    /** list of data objects describing toasts */
    toasts: IToast[];
    /** toast close/timeout event handler */
    on_close?: (idx: number) => void;
}

/**
 * Determines whether the Toast can be displayed at specified position
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

/**
 * Grouped list of {@link Toast}s 
 * 
 * Displays toast queues in corner-positioned groups.
 * Each new toast is located at the top of the queue, shifting up
 * other toasts.
 * 
 * Each queue is independent. If the timeout of the toast is exceeded,
 * it closes automatically, emptying the queue.
 * Note that toasts in adjacent groups (i.e. {@link ToastPosition.TopLeft} and {@link ToastPosition.BottomLeft})
 * will overlap each other if the queues are full enough.
 * 
 * @see ToastViewProps
 * 
 * @category Core.Views
 */
export default class ToastView extends View<ToastViewProps, null> {
    static defaultProps: ToastViewProps = {
        toasts: [],
    }
    
    /**
     * Calls close handler for specific toast
     * 
     * @param idx index of the toast inside the group
     */
    handleToastClose(idx: number) {
        this.props.on_close && this.props.on_close(idx);
    }

    render(): React.ReactNode {
        const klass_names = {enter: 'toast_hidden', exit: 'toast_hidden toast_collapsed'};

        return <div className="cornfield">
            {
                Object.values(ToastPosition).map((pos: ToastPosition) => (
                    <TransitionGroup className={`toaster toaster_${pos}`} key={pos}>
                        {this.props.toasts.filter(t => filterToast(t, pos)).map((toast, i) => (
                            <CSSTransition key={toast.idx} timeout={200} classNames={klass_names}>
                                <Toast status={toast.status}
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
        </div>
    }
}