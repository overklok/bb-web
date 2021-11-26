import Presenter, {on, restore} from "../base/Presenter";
import ModalView from "../views/ModalView";
import ModalModel, {UpdateModalsEvent} from "../models/ModalModel";
import {IModalData} from "../datatypes/modal";

/**
 * @category Core.Presenters
 */
export default class ModalPresenter extends Presenter<ModalView> {
    protected modal: ModalModel;

    getInitialProps(): any {
        this.modal = this.getModel(ModalModel);

        this.closeModal = this.closeModal.bind(this);

        return {
            on_close: this.closeModal,
        }
    }

    protected pushModal(modal_data: IModalData, modal_type?: string): number {
        return this.modal.showModal(modal_data, modal_type);
    }

    protected closeModal(index: number, modal_type: string) {
        this.modal.hideModal(index, modal_type);
    }

    @restore() @on(UpdateModalsEvent)
    protected updateModals() {
        this.setViewProps({
            modals: {...this.modal.getState().modals}
        });
    }
}