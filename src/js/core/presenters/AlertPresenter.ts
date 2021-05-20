import Presenter, {on} from "../base/Presenter";
import ModalModel, {UpdateAlertsEvent} from "../models/ModalModel";
import AlertView, {AlertType} from "../views/modal/AlertView";

export default class AlertPresenter extends Presenter<AlertView> {
    private modal: ModalModel;

    getInitialProps(): any {
        this.modal = this.getModel(ModalModel);
    }

    protected pushAlert(type: AlertType, on_accept: (type: AlertType) => void) {
        this.modal.showAlert(type, {
            on_accept,
            on_close: this.closeAlert.bind(this),
        });
    }

    protected closeAlert(type: AlertType) {
        this.modal.hideAlert(type);
    }

    @on(UpdateAlertsEvent)
    private updateAlerts() {
        this.setViewProps({
            alerts: {...this.modal.getState().alerts}
        });
    }
}