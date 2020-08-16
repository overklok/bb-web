import {TransitionGroup, Transition, CSSTransition} from 'react-transition-group';

import * as React from "react";
import classNames from "classnames";

import '../../../../css/core/modal.less'
import {useState} from "react";

export type ModalSize = 'sm'|'md'|'lg';

export interface IOverlayProps {
    onClose: Function;
}

export interface IModalProps {
    children?: string | JSX.Element | JSX.Element[];
    size?: ModalSize;
    width?: number|string;
    height?: number|string;
}

const Overlay = (props: IOverlayProps) => {
    const onOverlayClick = (e: React.MouseEvent<HTMLElement>) => {
        props.onClose && props.onClose(e);
    };

    // Список классов, которые должны использоваться в зависимости от свойств
    let klasses_overlay = classNames({
        'mdl-overlay': true,
    });

    return (
        <div className={klasses_overlay} onClick={onOverlayClick}/>
    )
}

const Modal = (props: IModalProps) => {
    // Список классов, которые должны использоваться в зависимости от свойств
    let klasses_modal = classNames({
        'mdl': true,
        'mdl_sz_sm': props.size === 'sm',
        'mdl_sz_md': props.size === 'md',
        'mdl_sz_lg': props.size === 'lg',
    })

    return (
        <div className={klasses_modal} style={{width: props.width, height: props.height}}>
            {props.children}
        </div>
    )
};

export {Overlay};
export default Modal;