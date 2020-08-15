// @ts-ignore (used here just to suppress IDE warning)
import {TransitionGroup, Transition, CSSTransition} from 'react-transition-group';

import * as React from "react";
import classNames from "classnames";

import '../../../../css/core/modal.less'
import {useState} from "react";

export type ModalSize = 'sm'|'md'|'lg';

export interface IModalProps {
    onClose: Function;
    children?: string | JSX.Element | JSX.Element[];
    size?: ModalSize;
    width?: number|string;
    height?: number|string;
}

const Modal = (props: IModalProps) => {
    const onOverlayClick = (e: React.MouseEvent<HTMLElement>) => {
        props.onClose && props.onClose(e);
    };

    // Список классов, которые должны использоваться в зависимости от свойств
    let klasses_overlay = classNames({
        'mdl-overlay': true,
    });

    let klasses_modal = classNames({
        'mdl': true,
        'mdl_sz_sm': props.size === 'sm',
        'mdl_sz_md': props.size === 'md',
        'mdl_sz_lg': props.size === 'lg',
    })

    return (
        <React.Fragment>
            <div className={klasses_overlay} onClick={onOverlayClick} />
            <TransitionGroup component={null}>
                <CSSTransition key='k' timeout={600} classNames="mdl">
                    <div className={klasses_modal} style={{width: props.width, height: props.height}}>
                        {props.children}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </React.Fragment>
    )
};

export default Modal;