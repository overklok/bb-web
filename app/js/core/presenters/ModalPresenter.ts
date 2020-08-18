import Presenter, {on} from "../base/Presenter";
import ModalView from "../views/modal/ModalView";
import {ShowModalEvent} from "../models/ModalModel";

export default class ModalPresenter extends Presenter<ModalView> {
    @on(ShowModalEvent)
    private onShowModal(evt: ShowModalEvent) {
        const {modal_data} = evt;

        console.log(evt);

        this.view.showModal(modal_data);
    }
}