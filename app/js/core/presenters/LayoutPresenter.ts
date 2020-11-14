import Presenter, {on, restore} from "../base/Presenter";
import LayoutView, {LayoutMountEvent} from "../views/layout/LayoutView";
import LayoutModel, {SetModeEvent} from "../models/LayoutModel";


export default class LayoutPresenter extends Presenter<LayoutView> {
    private model: LayoutModel;

    protected ready() {
        this.model = this.getModel(LayoutModel);
        const options = this.model.getOptions();

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
}