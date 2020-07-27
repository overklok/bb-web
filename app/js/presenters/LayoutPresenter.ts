import Presenter, {on} from "../core/base/Presenter";
import LayoutView, {ILayoutMode} from "../core/views/layout/LayoutView";
import {LayoutModel} from "../core/models/LayoutModel";
import layouts_config from "../configs/layouts";
import {MountEvent} from "../core/base/View";

export default class LayoutPresenter extends Presenter<LayoutView> {
    private model: LayoutModel;
    constructor(view: LayoutView) {
        super(view);

        this.model = new LayoutModel(layouts_config as unknown as {[key: string]: ILayoutMode});
    }

    @on(MountEvent)
    mounted() {
        this.view.setModes(this.model.modes);
    }
}