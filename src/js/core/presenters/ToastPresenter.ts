import Presenter, {on} from "../base/Presenter";
import {GenericErrorEvent} from "../base/Event";
import ToastView from "../views/ToastView";
import {ColorAccent} from "../helpers/styles";
import ModalModel, {UpdateToastsEvent} from "../models/ModalModel";
import i18next from "i18next";

/**
 * @category Core.Presenters
 */
export default class ToastPresenter extends Presenter<ToastView> {
    private modal: ModalModel;

    getInitialProps(): any {
        this.modal = this.getModel(ModalModel);

        this.closeToast = this.closeToast.bind(this);

        return {
            on_close: this.closeToast,
        }
    }

    @on(GenericErrorEvent)
    private pushToast(evt: GenericErrorEvent) {
        try {
            const {error} = evt;

            this.modal.showToast({
                title: i18next.t('main:general.error', {err: error.name}),
                content: error.message,
                timeout: 5000,
                status: ColorAccent.Danger
            });
        } catch (e) {
            // avoid potential recursive call
            throw e;
        }
    }

    @on(UpdateToastsEvent)
    private updateToasts() {
        this.setViewProps({
            toasts: [...this.modal.getState().toasts]
        });
    }

    private closeToast(idx: number) {
        this.modal.hideToast(idx);
    }
}