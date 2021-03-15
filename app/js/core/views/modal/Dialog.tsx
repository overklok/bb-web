import * as React from "react";
import classNames from "classnames";
import {ModalAction} from "../../base/view/Nest";

export interface IDialogProps {
    heading?: string;
    hint?: string;
    children?: string | JSX.Element | JSX.Element[];
    is_closable?: boolean;
    is_centered?: boolean;

    on_close?: Function | boolean;
    on_accept?: Function | boolean;
    on_dismiss?: Function | boolean;

    label_accept?: string;
    label_dismiss?: string;
}

const Dialog = (props: IDialogProps) => {
    const {} = props;

    const onClose = (action: ModalAction) => {
        props.on_close && typeof props.on_close === "function" && props.on_close(action);
    };

    const onAccept = () => {
        props.on_accept && typeof props.on_accept === "function" && props.on_accept();
        onClose(ModalAction.Accept);
    }

    const onDismiss = () => {
        props.on_dismiss && typeof props.on_dismiss === "function" && props.on_dismiss();
        onClose(ModalAction.Dismiss);
    }

    const onEscape = () => {
        onClose(ModalAction.Escape);
    }

    React.useEffect(() => {
        const keyListener = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {onDismiss()}
            if (e.key === 'Enter') {onAccept()}
        }

        document.addEventListener("keydown", keyListener);

        return () => document.removeEventListener("keydown", keyListener);
    });

    // Список классов, которые должны использоваться в зависимости от свойств
    const klasses_dialog = classNames({
        'mdl-dlg': true,
        'mdl-dlg_centered': props.is_centered
    });

    const klasses_btn_bar = classNames({
        'btn-bar': true,
        'btn-bar_right': !props.is_centered
    })

    let footer = null,
        hint = null,
        header = null;

    if (props.on_accept || props.on_dismiss) {
        footer = (
            <div className='mdl-dlg__footer'>
                <div className={klasses_btn_bar}>
                    {props.on_dismiss
                        ? <div className='btn btn_danger'
                               onClick={e => onDismiss()}>{props.label_dismiss || 'Отклонить'}</div>
                        : null
                    }
                    {props.on_accept
                        ? <div className='btn btn_primary'
                               onClick={e => onAccept()}>{props.label_accept || 'Принять'}</div>
                        : null
                    }
                </div>
            </div>
        );
    }

    if (props.hint) {
        hint = (
            <div className='mdl-dlg__hint'>{props.hint}</div>
        );
    }

    if (props.is_closable || props.heading) {
        header = (
            <div className='mdl-dlg__header'>
                <div className='mdl-dlg__heading'>
                    {props.heading}
                </div>
                <div className='mdl-dlg__buttons'>
                    {props.is_closable
                        ? <div className='mdl-btn-close' title='Закрыть' onClick={onEscape} />
                        : null
                    }
                </div>
            </div>
        )
    }

    return (
        <div className={klasses_dialog}>
            {header}
            <div className='mdl-dlg__body'>
                {props.children}
            </div>
            {footer}
            {hint}
        </div>
    )
};

export default Dialog;