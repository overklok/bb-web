import SettingsModel, {SettingsChangeEvent} from "../../core/models/SettingsModel";
import Presenter, {on, restore} from "../../core/base/Presenter";
import ServerModel from "~/js/models/common/ServerModel";
import ConnectionModel, { ConnectionStatusEvent } from "~/js/models/common/ConnectionModel";
import UpdateView from "~/js/views/controls/UpdateView";

export default class UpdatePresenter extends Presenter<UpdateView.UpdateView> {
    private model_server: ServerModel;

    getInitialProps() {
        this.model_server = this.getModel(ServerModel);
    }

    @restore() @on(ConnectionStatusEvent)
    protected async setVersionNumbers(evt: ConnectionStatusEvent) {
        const ver_latest_client = await this.model_server.getLatestClient();

        const [v_min, v_maj, v_ptc, ...postfix] = evt.version.self;

        const ver_local = [v_min, v_maj, v_ptc].join('.') + postfix.join('');
        const ver_remote = ver_latest_client.version;

        this.setViewProps({
            version_new: ver_remote,
            version_old: ver_local,
            download_url: ver_latest_client.file
        });
    }
}