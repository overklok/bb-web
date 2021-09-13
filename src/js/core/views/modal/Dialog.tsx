import * as React from "react";
import classNames from "classnames";
import {ModalAction} from "../../base/view/Nest";

import i18next from "i18next";

export interface IDialogProps {
    heading?: string;
    hint?: string;
    children?: string | JSX.Element | JSX.Element[];
    is_closable?: boolean;
    is_centered?: boolean;

    on_action?: (action: ModalAction) => void;
    is_acceptable?: boolean;
    is_dismissible?: boolean;

    label_accept?: string;
    label_dismiss?: string;
}

const Dialog = (props: IDialogProps) => {
    const {} = props;

    const onAction = (action: ModalAction) => {
        props.on_action && props.on_action(action);
    };

    const onAccept = () => {
        onAction(ModalAction.Accept);
    }

    const onDismiss = () => {
        onAction(ModalAction.Dismiss);
    }

    const onEscape = () => {
        onAction(ModalAction.Escape);
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

    if (props.is_acceptable || props.is_dismissible) {
        footer = (
            <div className='mdl-dlg__footer'>
                <div className={klasses_btn_bar}>
                    {props.is_dismissible
                        ? <div className='btn btn_danger'
                               onClick={e => onDismiss()}>{props.label_dismiss || i18next.t('main:dialog.decline')}</div>
                        : null
                    }
                    {props.is_acceptable
                        ? <div className='btn btn_primary'
                               onClick={e => onAccept()}>{props.label_accept || i18next.t('main:dialog.accept')}</div>
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
                        ? <div className='mdl-btn-close' title={i18next.t('main:dialog.close')} onClick={onEscape} />
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