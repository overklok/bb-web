import * as React from "react";
import classNames from "classnames";

export interface IDialogProps {
    heading?: string;
    hint?: string;
    onClose?: Function;
    children?: string | JSX.Element | JSX.Element[];
}

const Dialog = (props: IDialogProps) => {
    const onClose = (e: React.MouseEvent<HTMLElement>) => {
        props.onClose && props.onClose(e);
    };

    const {} = props;

    // Список классов, которые должны использоваться в зависимости от свойств
    const klasses_dialog = classNames({
        'mdl-dlg': true,
    })

    return (
        <div className={klasses_dialog}>
            <div className='mdl-dlg__header'>
                <div className='mdl-dlg__heading' children={props.heading} />
                <div className='mdl-dlg__buttons'>
                    <div className='mdl-btn-close' title='Закрыть' onClick={onClose} />
                </div>
            </div>
            <div className='mdl-dlg__body'>
                {props.children}
            </div>
            {props.hint
                ? <div className='mdl-dlg__footer'>{props.hint}</div>
                : null
            }
        </div>
    )
};

export default Dialog;