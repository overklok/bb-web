import Router from "../base/Router";
import LayoutModel from "../models/LayoutModel";

export default class LayoutRouter extends Router<string> {
    private model_layout: LayoutModel;

    public launch(): void {
        this.model_layout = this.getModel(LayoutModel);
        this.model_layout.setMode('test');
        console.log('requested set test');
    }

    protected direct(destination: string): void {

    }
}