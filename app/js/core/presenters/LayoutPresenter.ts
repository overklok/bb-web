import Presenter, {on} from "../base/Presenter";
import LayoutView, {LayoutMountEvent} from "../views/layout/LayoutView";
import LayoutModel, {SetModeEvent} from "../models/LayoutModel";
import {RouterEvent} from "../base/Event";

/**
 * A special kind of RouterEvent which can be used to switch layouts with route switching simultaneously
 */
export abstract class LayoutRouterEvent extends RouterEvent<LayoutRouterEvent> {
    mode: string;
}

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

    @on(SetModeEvent, LayoutRouterEvent)
    protected setMode(evt: SetModeEvent|LayoutRouterEvent) {
        this.view.setMode(evt.mode);
    }
}