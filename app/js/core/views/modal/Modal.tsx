import * as React from "react";
import classNames from "classnames";

import '../../../../css/modal.less'

export interface IModalProps {
    onClose: Function;
    children?: string | JSX.Element | JSX.Element[];
}

const Modal = (props: IModalProps) => {
    const onClose = (e: React.MouseEvent<HTMLElement>) => {
        props.onClose && props.onClose(e);
    };

    // Список классов, которые должны использоваться в зависимости от свойств
    let klasses_overlay = classNames({
        'mdl-overlay': true,
    });

    let klasses_modal = classNames({
        'mdl': true
    })

    return (
        <div className={klasses_overlay} onClick={onClose}>
            <div className={klasses_modal}>
                {props.children}
            </div>
        </div>
    )
};

export default Modal;