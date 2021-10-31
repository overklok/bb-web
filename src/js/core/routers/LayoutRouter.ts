import Router from "../base/Router";
import LayoutModel from "../models/LayoutModel";

/**
 * @category Core.Routers
 */
export default class LayoutRouter extends Router<string> {
    private model_layout: LayoutModel;

    public launch() {
        super.launch();

        this.model_layout = this.getModel(LayoutModel);
    }

    protected direct(destination: string): void {
        this.model_layout.setMode(destination);
    }
}