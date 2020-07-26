import Presenter from "../core/base/Presenter";
import LayoutView, {ILayoutMode} from "../core/views/layout/LayoutView";
import {LayoutModel} from "../core/models/LayoutModel";
import layouts_config from "../configs/layouts";

export default class LayoutPresenter extends Presenter<LayoutView> {
    constructor(view: LayoutView) {
        super(view);

        const model = new LayoutModel(layouts_config as unknown as {[key: string]: ILayoutMode});
        view.setModes(model.modes);
    }
}