import * as React from "react";

import '../../../../css/core/modal.less'
import DialogModal, {IDialogModalProps} from "./DialogModal";
import {Widget} from "../../services/interfaces/IViewService";
import Nest from "../../base/view/Nest";

interface IWidgetModalProps {
    content?: Widget<any> | string;
}

export type IWidgetDialogModalProps = IWidgetModalProps & IDialogModalProps;

const WidgetDialogModal = (props: IWidgetDialogModalProps) => {
    let content;
    
    if (typeof props.content === 'object') {
        content = (
            <Nest connector={props.content.connector}
                  index={0}
                  label={props.content.label}
                  view_type={props.content.view_type}
                  view_props={props.content.view_props}
                  close_request={() => props.on_close()}
            />
        )
    }
    
    return (
        <DialogModal size={props.size} 
                     width={props.width} 
                     height={props.height}
                     heading={props.heading} 
                     hint={props.hint} 
                     on_close={props.on_close}
                     on_accept={props.on_accept}
                     on_dismiss={props.on_dismiss}
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