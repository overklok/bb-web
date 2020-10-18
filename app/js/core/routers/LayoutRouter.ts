import Router from "../base/Router";
import LayoutModel from "../models/LayoutModel";

export default class LayoutRouter extends Router<string> {
    private model_layout: LayoutModel;

    public launch(): void {
        this.model_layout = this.getModel(LayoutModel);
        this.model_layout.setMode('default');
        console.log('requested set default');
    }

    protected direct(destination: string): void {

    }
}