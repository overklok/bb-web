import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {ModelEvent} from "../base/Event";
import {AlertType} from "../views/AlertView";
import {IAlertData, IModalData, IModalDataWithIndex, IToastData, IToastDataWithIndex} from "../datatypes/modal";
import {ModalAction} from "../views/ModalView";

export class UpdateModalsEvent extends ModelEvent<UpdateModalsEvent> {}
export class UpdateAlertsEvent extends ModelEvent<UpdateAlertsEvent> {}
export class UpdateToastsEvent extends ModelEvent<UpdateToastsEvent> {}

/**
 * @category Core.Models
 */
interface ModalModelState {
    alerts: {[type: number]: IAlertData};
    modals: {[type: string]: IModalDataWithIndex[]};
    toasts: IToastDataWithIndex[];
}

/**
 * @category Core.Models
 */
export default class ModalModel extends Model<ModalModelState, DummyDatasource> {
    static alias = 'modal';

    protected defaultState: ModalModelState = {
        alerts: {},
        modals: {},
        toasts: []
    };

    public showModal(modal: IModalData, type: string = 'default'): number {
        if (!this.state.modals.hasOwnProperty(type)) {
            this.state.modals[type] = [];
        }
        
        const modals_num = this.state.modals[type].push({...modal, idx: this.state.modals[type].length});
        
        // TODO: for non-default channels, only one modal at a time is allowed

        this.emit(new UpdateModalsEvent());
        
        return modals_num - 1;
    }
    
    public hideModal(modal_idx: number, type: string = 'default') {
        this.state.modals[type].splice(modal_idx, 1);

        if (this.state.modals[type].length === 0) {
            delete this.state.modals[type];
        }

        this.emit(new UpdateModalsEvent());
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
        const toast_num = this.state.toasts.push({...toast, idx: this.state.toasts.length});

        this.emit(new UpdateToastsEvent({}));

        return toast_num - 1;
    }

    public hideToast(toast_idx: number) {
        delete this.state.toasts[toast_idx];

        this.emit(new UpdateToastsEvent({}));
    }

    public async showQuestionModal(modal_data: IModalData): Promise<boolean> {
        return new Promise(resolve => {
            this.showModal({
                ...modal_data,
                dialog: {
                    ...modal_data.dialog,
                    on_action: (action: ModalAction) => {
                        modal_data.dialog.on_action && modal_data.dialog.on_action(action);
                        resolve(action === ModalAction.Accept);
                    },
                }
            });
        });
    }
}