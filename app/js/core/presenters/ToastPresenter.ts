import Presenter, {on} from "../base/Presenter";
import {GenericErrorEvent} from "../base/Event";
import ToastView, {IToast} from "../views/modal/ToastView";
import {ColorAccent} from "../helpers/styles";

export default class ToastPresenter extends Presenter<ToastView> {
    protected toasts: IToast[] = [];

    getInitialProps(): any {
        this.closeToast = this.closeToast.bind(this);

        return {
            on_close: this.closeToast,
        }
    }

    @on(GenericErrorEvent)
    private showToast(evt: GenericErrorEvent) {
        try {
            const {error} = evt;

            this.toasts.push({
                title: `Ошибка [${error.name}]`,
                content: error.message,
                timeout: 5000,
                status: ColorAccent.Danger
            });

            this.setViewProps({
                toasts: [...this.toasts]
            });
        } catch (e) {
            // avoid potential recursive call
            throw e;
        }
    }

    private closeToast(idx: number) {
        delete this.toasts[idx];

        this.setViewProps({
            toasts: [...this.toasts]
        });
    }
}