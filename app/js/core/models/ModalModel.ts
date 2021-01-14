import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {ModelEvent} from "../base/Event";
import {ColorAccent} from "../helpers/styles";
import {AlertType} from "../views/modal/AlertView";

interface IDialogData {
    heading?: string;
    hint?: string;
}

interface IFullDialogData extends IDialogData {
    label_accept?: string;
    label_dismiss?: string;
    on_accept?: Function;
    on_dismiss?: Function;
}

interface IModalData {
    dialog: IDialogData;

    content?: string;
    widget_alias?: string;

    size?: 'sm'|'md'|'lg';
    width?: number|string;
    height?: number|string;

    is_closable?: boolean;
}

interface IToastData {
    title?: string;
    content?: string;
    status: ColorAccent;
    timeout?: number;
}

interface IAlertData {
    on_accept?: Function;
    on_close?: (type: AlertType) => void;
}

interface IFullModalData extends IModalData {
    dialog: IFullDialogData;
}


export class ShowModalEvent extends ModelEvent<ShowModalEvent> {
    modal_data: IFullModalData;
}

export class UpdateAlertsEvent extends ModelEvent<ShowModalEvent> {
}

export class UpdateToastsEvent extends ModelEvent<ShowModalEvent> {
}

interface ModalStorage {
    alerts: {[type: number]: IAlertData};
    toasts: IToastData[];
}

export default class ModalModel extends Model<ModalStorage, DummyDatasource>{
    protected defaultState: ModalStorage = {
        alerts: {},
        toasts: []
    };

    public showModal(modal_data: IModalData) {
        this.emit(new ShowModalEvent({modal_data}));
    }

    public showAlert(type: AlertType, alert?: IAlertData) {
        this.state.alerts[type] = alert;

        this.emit(new UpdateAlertsEvent({}));
    }

    public hideAlert(alert_type: AlertType) {
        delete this.state.alerts[alert_type];

        this.emit(new UpdateAlertsEvent({}));
    }

    public showToast(toast: IToastData): number {
        const toast_num = this.state.toasts.push(toast);

        this.emit(new UpdateToastsEvent({}));

        return toast_num - 1;
    }

    public hideToast(toast_idx: number) {
        delete this.state.toasts[toast_idx];

        this.emit(new UpdateToastsEvent({}));
    }

    public async showQuestionModal(modal_data: IFullModalData): Promise<boolean> {
        return new Promise(resolve => {
            this.emit(new ShowModalEvent({
                modal_data: {
                    ...modal_data,
                    dialog: {
                        ...modal_data.dialog,
                        on_accept: () => {
                            modal_data.dialog.on_accept && modal_data.dialog.on_accept();
                            resolve(true);
                        },
                        on_dismiss: () => {
                            modal_data.dialog.on_dismiss && modal_data.dialog.on_dismiss();
                            resolve(false);
                        },
                    }
                }
            }));
        });
    }
}