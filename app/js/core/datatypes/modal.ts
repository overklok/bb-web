import {ColorAccent, ToastPosition} from "../helpers/styles";
import {AlertType} from "../views/modal/AlertView";

export interface IDialogData {
    heading?: string;
    hint?: string;
    label_accept?: string;
    label_dismiss?: string;
    on_accept?: Function | boolean;
    on_dismiss?: Function | boolean;
}

export interface IModalData {
    dialog: IDialogData;
    content?: string;
    widget_alias?: string;

    size?: 'sm'|'md'|'lg';
    width?: number|string;
    height?: number|string;

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
