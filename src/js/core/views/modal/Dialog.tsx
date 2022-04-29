import * as React from "react";
import classNames from "classnames";

import i18next from "i18next";
import {ModalAction} from "../ModalView";

/**
 * Props for {@link Dialog}
 * 
 * @category Core.UI
 */
export interface DialogProps {
    /** window heading caption */
    heading?: string;
    /** window footer */
    hint?: string;
    /** window content */
    children?: string | JSX.Element | JSX.Element[];
    /** display close button in the heading */
    is_closable?: boolean;
    /** whether to center the content */
    is_centered?: boolean;

    /** modal action handler */
    on_action?: (action: ModalAction) => void;
    /** display accept button in the bottom */
    is_acceptable?: boolean;
    /** display dismiss button in the bottom */
    is_dismissible?: boolean;

    /** accept button caption */
    label_accept?: string;
    /** dismiss button caption */
    label_dismiss?: string;
}

/**
 * Dialog frame for floating content such as {@link Modal}
 * 
 * Contains basic dialog UI including optional action buttons.
 * Used with {@link Modal}s to create windows.
 * 
 * When both `{@link DialogProps}.is_closable` and `{@link DialogProps}.heading` is undefined,
 * the heading will not be rendered.
 * 
 * If whether `{@link DialogProps}.label_accept` or `{@link DialogProps}.label_dismiss` is omitted,
 * the default captions will be used for each of the buttons when displayed.
 * 
 * @see DialogProps
 * 
 * @category Core.UI
 * 
 * @component
 * @example
 * return (
 *      <Dialog 
 *          heading='Sample Heading' 
 *          hint='Sample Hint' 
 *          is_closable={true} 
 *          is_acceptable={true}
 *          is_dismissible={true}
 *          label_accept='Sample Accept'
 *          label_dismiss='Sample Dismiss'
 *      >
 *          Sample Content
 *      </Dialog>
 * )
 */
export default function Dialog(props: DialogProps) {
    /**
     * Calls action handler
     * 
     * @param action modal action type
     */
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
}