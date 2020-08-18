import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {ModelEvent} from "../base/Event";

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

interface IFullModalData extends IModalData {
    dialog: IFullDialogData;
}

export class ShowModalEvent extends ModelEvent<ShowModalEvent> {
    modal_data: IFullModalData;
}

export default class ModalModel extends Model<undefined, DummyDatasource>{
    protected defaultState: undefined;

    public showModal(modal_data: IModalData) {
        this.emit(new ShowModalEvent({modal_data}));
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