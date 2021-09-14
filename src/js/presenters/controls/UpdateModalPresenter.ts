
import ModalPresenter from "~/js/core/presenters/ModalPresenter";
import Presenter, { on, restore } from "~/js/core/base/Presenter";
import ConnectionModel, { ConnectionStatusEvent } from "~/js/models/common/ConnectionModel";
import ServerModel from "~/js/models/common/ServerModel";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

export default class UpdateModalPresenter extends ModalPresenter {
    static ModalType = 'update';

    // private model_modal: ModalModel;
    private model_server: ServerModel;
    private ver_latest_client: { version: string; file: string; };

    getInitialProps() {
        this.model_server = this.getModel(ServerModel);

        super.getInitialProps();
    }

    @on(ConnectionStatusEvent)
    private async updateVersionNumbers(evt: ConnectionStatusEvent) {
        try {
            this.ver_latest_client = this.ver_latest_client || await this.model_server.getLatestClient();
        } catch (e) {
            console.log("Cannot obtain latest client version, so version check will be omitted");
        }

        if (!this.ver_latest_client) return;

        const ver_local = evt.version.self.join('.');
        const ver_remote = this.ver_latest_client.version;

        if (ver_local < ver_remote) {
            this.setViewProps({
                modals: {
                    update: [{
                        widget_alias: 'update',
                        size: 'md',
                        dialog: {
                            is_centered: true,
                            is_acceptable: true,
                            label_accept: 'OK',
                            on_action: () => { this.setViewProps({ modals: {} }) },
                        }
                    }]
                }
            });
        }
    }
}