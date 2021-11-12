import {ColorAccent, ToastPosition} from "../helpers/styles";
import {AlertType} from "../views/AlertView";
import {ModalAction} from "../views/ModalView";

/**
 * Description of dialog for {@link ModalView}
 * 
 * This is an abstract data object 
 * which is not applied directly to the {@link Dialog} component.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface IDialogData {
    /** text on the top of the modal */
    heading?: string;
    /** text on the bottom of the modal */
    hint?: string;
    /** accept button label */
    label_accept?: string;
    /** dismiss button label */
    label_dismiss?: string;
    /** modal action handler */
    on_action?: (action: ModalAction) => void;
    /** display accept button */
    is_acceptable?: boolean;
    /** display dismiss button */
    is_dismissible?: boolean;
    /** whether to center the content */
    is_centered?: boolean;
}

/**
 * Description of modal for {@link ModalView}
 * 
 * This is an abstract data object 
 * which is not applied directly to the {@link Modal} component.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface IModalData {
    dialog: IDialogData;
    content?: string;
    widget_alias?: string;

    size?: 'sm'|'md'|'lg';
    width?: number|string;
    height?: number|string;

    is_close_manual?: boolean;
    is_closable?: boolean;
}

/**
 * @category Core
 * @subcategory Misc
 */
export interface IModalDataWithIndex extends IModalData {
    idx: number;
}

/**
 * Description of toast for {@link ModalView}
 * 
 * This is an abstract data object 
 * which is not applied directly to the {@link Toast} component.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface IToastData {
    title?: string;
    content?: string;
    status: ColorAccent;
    timeout?: number;
    position?: ToastPosition;
    action?: {title: string, callback: Function};
}

/**
 * @category Core
 * @subcategory Misc
 */
export interface IToastDataWithIndex extends IToastData {
    idx: number;
}

/**
 * Description of alert for {@link AlertView}
 * 
 * This is an abstract data object 
 * which is not applied directly to the {@link Alert} component.
 * 
 * @category Core
 * @subcategory Misc
 */
export interface IAlertData {
    on_accept?: Function;
    on_close?: (type: AlertType) => void;
}
