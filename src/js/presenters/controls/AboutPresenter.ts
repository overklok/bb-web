import Presenter, { on, restore } from "~/js/core/base/Presenter";
import AboutView from "~/js/views/controls/AboutView";
import { ConnectionStatusEvent } from "~/js/models/common/ConnectionModel";
import ServerModel from "~/js/models/common/ServerModel";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

export default class AboutPresenter extends Presenter<AboutView.AboutView> {
    ver_srv: { self: number[]; core: number[]; verifier: number[]; };
    model_server: ServerModel;

    getInitialProps(): AboutView.Props {
        this.model_server = this.getModel(ServerModel);

        this.updateVersionNumbers();

        return {
            ver_web: __VERSION__
        }
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