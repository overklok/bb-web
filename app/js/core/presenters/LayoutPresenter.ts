import Presenter, {on} from "../base/Presenter";
import LayoutView, {LayoutMountEvent} from "../views/layout/LayoutView";
import LayoutModel from "../models/LayoutModel";

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
    mounted() {
        const modes = this.model.getModes();

        this.view.setModes(modes);
    }
}