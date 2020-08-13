import Presenter, {on} from "../base/Presenter";
import ModalView from "../views/modal/ModalView";
import {ShowModalEvent} from "../models/ModalModel";

export default class ModalPresenter extends Presenter<ModalView> {
    @on(ShowModalEvent)
    private onShowModal(evt: ShowModalEvent) {
        this.view.showModal(evt.modal_data);
    }
}