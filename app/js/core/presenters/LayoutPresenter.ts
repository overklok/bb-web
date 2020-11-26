import Presenter, {on, restore} from "../base/Presenter";
import LayoutView, {LayoutFinishedEvent, LayoutMountEvent} from "../views/layout/LayoutView";
import LayoutModel, {SetModeEvent} from "../models/LayoutModel";

export default class LayoutPresenter extends Presenter<LayoutView> {
    protected model_layout: LayoutModel;

    public ready() {
        this.model_layout = this.getModel(LayoutModel);
        const options = this.model_layout.getOptions();

        const mode = this.model_layout.getState().current_mode;
        if (mode) this.view.setMode(mode);
    }

    @on(LayoutMountEvent)
    protected mounted() {
        const modes = this.model_layout.getModes();

        this.view.setModes(modes);
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