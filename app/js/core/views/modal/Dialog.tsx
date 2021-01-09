import * as React from "react";
import classNames from "classnames";

export interface IDialogProps {
    heading?: string;
    hint?: string;
    children?: string | JSX.Element | JSX.Element[];
    is_closable?: boolean;

    on_close?: Function;
    on_accept?: Function;
    on_dismiss?: Function;

    label_accept?: string;
    label_dismiss?: string;
}

const Dialog = (props: IDialogProps) => {
    const {} = props;

    const onClose = () => {
        props.on_close && props.on_close();
    };

    const onAccept = () => {
        props.on_accept && props.on_accept();
        onClose();
    }

    const onDismiss = () => {
        props.on_dismiss && props.on_dismiss();
        onClose();
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
    });

    let footer = null,
        hint = null,
        header = null;

    if (props.on_accept || props.on_dismiss) {
        footer = (
            <div className='mdl-dlg__footer'>
                <div className='btn-bar btn-bar_right'>
                    {props.on_dismiss
                        ? <div className='btn btn_danger'
                               onClick={e => onDismiss()}>{props.label_dismiss || 'Отклонить'}</div>
                        : null
                    }
                    {props.on_accept
                        ? <div className='btn btn_success'
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
                <div className='mdl-dlg__heading' children={props.heading} />
                <div className='mdl-dlg__buttons'>
                    {props.is_closable
                        ? <div className='mdl-btn-close' title='Закрыть' onClick={onClose} />
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