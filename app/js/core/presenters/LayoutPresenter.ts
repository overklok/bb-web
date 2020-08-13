import Presenter, {on} from "../base/Presenter";
import LayoutView, {LayoutMountEvent} from "../views/layout/LayoutView";
import LayoutModel from "../models/LayoutModel";

export default class LayoutPresenter extends Presenter<LayoutView> {
    private model: LayoutModel;

    protected ready() {
        this.model = this.getModel(LayoutModel);
    }

    @on(LayoutMountEvent)
    mounted() {
        const modes = this.model.getFormatted();

        console.log(modes);

        this.view.setModes(modes);
    }
}