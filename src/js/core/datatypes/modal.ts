import {ColorAccent, ToastPosition} from "../helpers/styles";
import {AlertType} from "../views/modal/AlertView";
import {ModalAction} from "../views/modal/ModalView";

export interface IDialogData {
    heading?: string;
    hint?: string;
    label_accept?: string;
    label_dismiss?: string;
    on_action?: (action: ModalAction) => void;
    is_acceptable?: boolean;
    is_dismissible?: boolean;
    is_centered?: boolean;
}

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

export interface IModalDataWithIndex extends IModalData {
    idx: number;
}

export interface IToastData {
    title?: string;
    content?: string;
    status: ColorAccent;
    timeout?: number;
    position?: ToastPosition;
    action?: {title: string, callback: Function};
}

export interface IToastDataWithIndex extends IToastData {
    idx: number;
}

export interface IAlertData {
    on_accept?: Function;
    on_close?: (type: AlertType) => void;
}
