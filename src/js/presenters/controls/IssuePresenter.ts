import Presenter, { on } from "~/js/core/base/Presenter";
import IssueView from "~/js/views/controls/IssueView";
import ConnectionModel, { IssueReportCompleteEvent } from "~/js/models/common/ConnectionModel";
import ModalModel from "~/js/core/models/ModalModel";
import { AlertType } from "~/js/core/views/modal/AlertView";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

export default class IssuePresenter extends Presenter<IssueView.IssueView> {
    private ver_srv: { self: number[]; core: number[]; verifier: number[]; };

    private model_modal: ModalModel;
    private model_connection: ConnectionModel;

    getInitialProps() {
        this.model_modal = this.getModel(ModalModel);
        this.model_connection = this.getModel(ConnectionModel);
    }

    @on(IssueView.LogDownloadRequestEvent)
    private requestLogDwnload() {

    }

    @on(IssueView.IssueReportRequestEvent)
    private requestIssueReport(evt: IssueView.IssueReportRequestEvent) {
        this.model_connection.requestIssueReport({server: this.ver_srv, web: __VERSION__}, evt.message);
    }

    @on(IssueReportCompleteEvent)
    private showIssueReportCompletedAlert() {
        this.model_modal.showAlert(AlertType.IssueReportCompleted);
    }
}