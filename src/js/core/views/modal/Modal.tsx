import * as React from "react";
import classNames from "classnames";

import '../../../../css/core/modal.less'

/**
 * @category Core.UI 
 */
export type ModalSize = 'sm'|'md'|'lg';

/**
 * Props for {@link Overlay}
 * 
 * @category Core.UI
 */
export interface OverlayProps {
    /** overlay click handler */
    on_close?: Function;
}

/**
 * Props for {@link Modal}
 * 
 * @category Core.UI
 */
export interface ModalProps {
    /** content of the modal */
    children?: string | JSX.Element | JSX.Element[];
    /** size of the elements, defines default width and height */
    size?: ModalSize;
    /** custom width (overrides default value from the size if defined) */
    width?: number|string;
    /** custom width (overrides default value from the size if defined) */
    height?: number|string;
}

/**
 * Surround of the {@link Modal}
 * 
 * Renders `div` element to catch outer clicks to provide a UI to close the modal.
 * 
 * Located preceding to the {@link Modal} at the same level of the DOM tree.
 * 
 * @see OverlayProps
 * 
 * @category Core.UI
 * 
 * @component
 */
export function Overlay (props: OverlayProps) {
    const onOverlayClick = (e: React.MouseEvent<HTMLElement>) => {
        props.on_close && props.on_close();
    };

    // Список классов, которые должны использоваться в зависимости от свойств
    let klasses_overlay = classNames({
        'mdl-overlay': true,
    });

    return (
        <div className={klasses_overlay} onClick={onOverlayClick}/>
    )
}

/**
 * Component displayed on the top of the rest of the content
 * 
 * @see ModalProps
 * 
 * @category Core.UI
 * 
 * @component
 */
export default function Modal (props: ModalProps) {
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
}