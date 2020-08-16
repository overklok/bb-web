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

interface IState {}

class Modal extends React.Component<IModalProps, IState> {
    constructor(p: IModalProps) {
        super(p);
    }

    render() {
        const onOverlayClick = (e: React.MouseEvent<HTMLElement>) => {
            this.props.onClose && this.props.onClose(e);
        };

        // Список классов, которые должны использоваться в зависимости от свойств
        let klasses_overlay = classNames({
            'mdl-overlay': true,
        });

        let klasses_modal = classNames({
            'mdl': true,
            'mdl_sz_sm': this.props.size === 'sm',
            'mdl_sz_md': this.props.size === 'md',
            'mdl_sz_lg': this.props.size === 'lg',
        })

        return (
            <React.Fragment>
                <div className={klasses_overlay} onClick={onOverlayClick}/>
                <TransitionGroup component={null}>
                    <CSSTransition key='k' timeout={600} classNames="mdl">
                        <div className={klasses_modal} style={{width: this.props.width, height: this.props.height}}>
                            {this.props.children}
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </React.Fragment>
        )
    }
};

export default Modal;