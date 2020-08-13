import * as React from "react";

import '../../../../css/modal.less'
import Modal, {IModalProps} from "./Modal";
import Dialog, {IDialogProps} from "./Dialog";

type IProps = IModalProps & IDialogProps;

const DialogModal = (props: IProps) => {
    return (
        <Modal onClose={props.onClose}>
            <Dialog heading={props.heading} hint={props.hint} onClose={props.onClose}>
                {props.children}
            </Dialog>
        </Modal>
    )
};

export default DialogModal;