import Presenter, {on, restore} from "../base/Presenter";
import LayoutView, {LayoutFinishedEvent} from "../views/layout/LayoutView";
import LayoutModel, {SetModeEvent} from "../models/LayoutModel";

export default class LayoutPresenter extends Presenter<LayoutView> {
    protected model_layout: LayoutModel;

    public getInitialProps() {
        this.model_layout = this.getModel(LayoutModel);
        const modes = this.model_layout.getModes();

        const {current_mode, options} = this.model_layout.getState();

        return {
            mode_name: current_mode,
            show_headers: options.show_headers,
            modes
        };
    }

    @restore() @on(SetModeEvent)
    protected setMode(evt: SetModeEvent) {
        this.view.setMode(evt.mode);
    }

    @on(LayoutFinishedEvent)
    protected reportLayoutModeFinished(evt: LayoutFinishedEvent) {
        this.model_layout.reportModeFinished(evt.mode_name);
    }
}