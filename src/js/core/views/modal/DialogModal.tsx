import * as React from "react";

import '../../../../css/core/modal.less'
import Modal, {IModalProps} from "./Modal";
import Dialog, {IDialogProps} from "./Dialog";

export type IDialogModalProps = IModalProps & IDialogProps;

const DialogModal = (props: IDialogModalProps) => {
    return (
        <Modal size={props.size} width={props.width} height={props.height}>
            <Dialog heading={props.heading}
                    hint={props.hint}
                    on_action={props.on_action}
                    is_acceptable={props.is_acceptable}
                    is_dismissible={props.is_dismissible}
                    label_accept={props.label_accept}
                    label_dismiss={props.label_dismiss}
                    is_closable={props.is_closable}
                    is_centered={props.is_centered}
            >
                {props.children}
            </Dialog>
        </Modal>
    )
};

export default DialogModal;