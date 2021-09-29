
import ModalPresenter from "~/js/core/presenters/ModalPresenter";
import Presenter, { on, restore } from "~/js/core/base/Presenter";
import ConnectionModel, { ConnectionStatusEvent } from "~/js/models/common/ConnectionModel";
import ServerModel from "~/js/models/common/ServerModel";
import i18next from "i18next";
import { ModalAction } from "~/js/core/base/view/Nest";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

export default class UpdateModalPresenter extends ModalPresenter {
    static ModalType = 'update';

    // private model_modal: ModalModel;
    private model_server: ServerModel;
    private model_connection: ConnectionModel;

    private ver_latest_client: { version: string; file: string; };

    getInitialProps() {
        this.model_server = this.getModel(ServerModel);
        this.model_connection = this.getModel(ConnectionModel);

        super.getInitialProps();
    }

    @on(ConnectionStatusEvent)
    private async updateVersionNumbers(evt: ConnectionStatusEvent) {
        if (evt.status !== 'connected') return;

        try {
            this.ver_latest_client = this.ver_latest_client || await this.model_server.getLatestClient();
        } catch (e) {
            console.log("Cannot obtain latest client version, so version check will be omitted");
        }

        if (!this.ver_latest_client) return;

        const ver_local = evt.version.self.join('.'),
              ver_skip = evt.version_skip.self;
        const ver_remote = this.ver_latest_client.version;

        if (ver_skip >= ver_remote) {
            console.warn(`Version ${ver_skip} is skipped by the client. New version can be downloaded here: ${this.ver_latest_client.file}`);
            return;
        }

        if (ver_local < ver_remote) {
            this.setViewProps({
                modals: {
                    update: [{
                        widget_alias: 'update',
                        size: 'md',
                        dialog: {
                            is_centered: true,
                            is_acceptable: true,
                            is_dismissible: true,
                            label_accept: i18next.t('main:update.accept'),
                            label_dismiss: i18next.t('main:update.skip'),
                            on_action: (action: ModalAction) => { 
                                switch (action) {
                                    case ModalAction.Accept:
                                    case ModalAction.Escape: {
                                        this.setViewProps({ modals: {} });
                                        break;
                                    }
                                    case ModalAction.Dismiss: {
                                        this.model_connection.requestSkipVersion(ver_remote);

                                        this.setViewProps({ modals: {} });
                                        break;
                                    }
                                }
                            },
                        }
                    }]
                }
            });
        }
    }
}