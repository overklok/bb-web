import Presenter, { on, restore } from "~/js/core/base/Presenter";
import AboutView from "~/js/views/controls/AboutView";
import { ConnectionStatusEvent } from "~/js/models/common/ConnectionModel";
import ServerModel from "~/js/models/common/ServerModel";
import ModalModel from "~/js/core/models/ModalModel";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

export default class AboutPresenter extends Presenter<AboutView.AboutView> {
    private ver_srv: { self: number[]; core: number[]; verifier: number[]; };

    private model_modal: ModalModel;
    private model_server: ServerModel;

    getInitialProps(): AboutView.Props {
        this.model_modal = this.getModel(ModalModel);
        this.model_server = this.getModel(ServerModel);

        this.updateVersionNumbers();

        return {
            ver_web: __VERSION__
        }
    }

    @on(AboutView.IssuePromptEvent)
    private showIssuePromptModal() {
        this.model_modal.showModal({
            dialog: {
                heading: 'Сообщить об ошибке',
            },
            widget_alias: 'issue',
            is_closable: true
        })
    }

    @restore() @on(ConnectionStatusEvent)
    private updateClientVersion(evt: ConnectionStatusEvent) {
        if (evt.version) {
            this.setViewProps({
                ver_cli: { self: evt.version.self, core: evt.version.core }
            });
        } else {
            this.setViewProps({
                ver_cli: { self: ['n/a'], core: ['n/a'] }
            })
        }
    }

    private async updateVersionNumbers() {
        const version = this.ver_srv || await this.model_server.getVersion();

        this.ver_srv = { self: version.self, core: version.core, verifier: version.verifier };

        this.setViewProps({
            ver_srv: this.ver_srv,
        });
    }
}