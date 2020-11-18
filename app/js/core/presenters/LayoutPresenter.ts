import Presenter, {on, restore} from "../base/Presenter";
import LayoutView, {LayoutFinishedEvent, LayoutMountEvent} from "../views/layout/LayoutView";
import LayoutModel, {SetModeEvent} from "../models/LayoutModel";


export default class LayoutPresenter extends Presenter<LayoutView> {
    private model: LayoutModel;

    protected ready() {
        this.model = this.getModel(LayoutModel);
        const options = this.model.getOptions();

        const mode = this.model.getState().current_mode;
        console.log(mode);
        if (mode) this.view.setMode(mode);

        this.view.setOptions({
            show_headers: options.show_headers
        });
    }

    @on(LayoutMountEvent)
    protected mounted() {
        const modes = this.model.getModes();

        this.view.setModes(modes);
    }

    @restore() @on(SetModeEvent)
    protected setMode(evt: SetModeEvent) {
        this.view.setMode(evt.mode);
    }

    @on(LayoutFinishedEvent)
    protected reportLayoutModeFinished(evt: LayoutFinishedEvent) {
        this.model.reportModeFinished(evt.mode_name);
    }
}