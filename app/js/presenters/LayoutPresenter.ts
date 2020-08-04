import Presenter, {on} from "../core/base/Presenter";
import LayoutView from "../core/views/layout/LayoutView";
import {LayoutModel} from "../core/models/LayoutModel";
import {MountEvent} from "../core/base/view/View";

export default class LayoutPresenter extends Presenter<LayoutView> {
    private model: LayoutModel;

    protected ready() {
        this.model = this.getModel(LayoutModel);
    }

    @on(MountEvent)
    mounted() {
        console.log(this.model.modes);
        this.view.setModes(this.model.modes);
    }
}