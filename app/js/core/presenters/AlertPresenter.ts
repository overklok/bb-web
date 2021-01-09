import Presenter, {on} from "../base/Presenter";
import {GenericErrorEvent} from "../base/Event";
import AlertView, {IToast} from "../views/modal/AlertView";
import {ColorAccent} from "../helpers/styles";

export default class AlertPresenter extends Presenter<AlertView> {
    protected alerts: IToast[] = [];
    protected alert_idx: number;

    getInitialProps(): any {
        this.closeToast = this.closeToast.bind(this);

        return {
            on_close: this.closeToast,
        }
    }

    @on(GenericErrorEvent)
    private async onAlert(evt: GenericErrorEvent) {
        try {
            const {error} = evt;

            this.alerts.push({
                title: `Ошибка [${error.name}]`,
                content: error.message,
                timeout: 5000,
                status: ColorAccent.Danger
            });

            this.setViewProps({
                toasts: [...this.alerts]
            });
        } catch (e) {
            // avoid potential recursive call
            throw e;
        }
    }

    private closeToast(idx: number) {
        delete this.alerts[idx];

        this.setViewProps({
            toasts: [...this.alerts]
        });
    }
}