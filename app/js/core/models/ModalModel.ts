import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {ModelEvent} from "../base/Event";

interface IModalData {
    heading?: string;
    hint?: string;
    content?: string;
    widget_alias?: string;
    is_dialog?: boolean;

    size?: 'sm'|'md'|'lg';
    width?: number|string;
    height?: number|string;
}

export class ShowModalEvent extends ModelEvent<ShowModalEvent> {
    modal_data: IModalData;
}

export default class ModalModel extends Model<undefined, DummyDatasource>{
    protected defaultState: undefined;

    public showModal(modal_data: IModalData) {
        this.emit(new ShowModalEvent({modal_data}));
    }
}