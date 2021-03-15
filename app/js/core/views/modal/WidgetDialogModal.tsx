import * as React from "react";

import '../../../../css/core/modal.less'
import DialogModal, {IDialogModalProps} from "./DialogModal";
import {Widget} from "../../services/interfaces/IViewService";
import Nest, {TerminalAction} from "../../base/view/Nest";

interface IWidgetModalProps {
    content?: Widget<any> | string;
    request_close?: boolean;
}

export type IWidgetDialogModalProps = IWidgetModalProps & IDialogModalProps;

const WidgetDialogModal = (props: IWidgetDialogModalProps) => {
    let [terminal_action, setTerminalAction] = React.useState(TerminalAction.None);

    let content;

    const onclose = (action: TerminalAction) => {
        switch (action) {
            case TerminalAction.Accept:
                props.on_accept && props.on_accept();
                break;
            case TerminalAction.Dismiss:
                props.on_dismiss && props.on_dismiss();
                break;
            case TerminalAction.Close:
                props.on_close && props.on_close();
                break;
        }
    }
    
    if (typeof props.content === 'object') {
        content = (
            <Nest connector={props.content.connector}
                  index={0}
                  label={props.content.label}
                  view_type={props.content.view_type}
                  view_props={props.content.view_props}
                  terminal_request={onclose}
                  terminal_reject={() => setTerminalAction(TerminalAction.None)}
                  terminal_action={terminal_action}
            />
        )
    }
    
    return (
        <DialogModal size={props.size} 
                     width={props.width} 
                     height={props.height}
                     heading={props.heading} 
                     hint={props.hint} 
                     on_close={() => setTerminalAction(TerminalAction.Close)}
                     on_accept={() => setTerminalAction(TerminalAction.Accept)}
                     on_dismiss={() => setTerminalAction(TerminalAction.Dismiss)}
                     label_accept={props.label_accept} 
                     label_dismiss={props.label_dismiss} 
                     is_closable={props.is_closable} 
                     is_centered={props.is_centered}
            >
            {content}
        </DialogModal>
    )
};

export default WidgetDialogModal;