import * as React from "react";

import Modal, {ModalProps} from "./Modal";
import Dialog, {DialogProps} from "./Dialog";

require('../../../../css/core/modal.less')

/**
 * Props for {@link DialogModal}
 * 
 * This is the combination of {@link ModalProps} and {@link DialogProps}.
 */
type DialogModalProps = ModalProps & DialogProps;

/**
 * {@link Modal} combined with {@link Dialog}
 * 
 * @see {@link DialogModalProps}
 * 
 * @category Core.UI
 * 
 * @component
 */
export default function DialogModal (props: DialogModalProps) {
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
}