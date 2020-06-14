import Presenter, {on} from "../../base/Presenter";
import {MountEvent, RenderEvent} from "../../base/View";
import TestView from "../views/TestView";

export default class MainPresenter extends Presenter<TestView> {
    constructor(view: TestView) {
        super(view);

        console.log("CREATED")
    }

    @on(MountEvent)
    actionMount(event: MountEvent) {
        console.log(this, event);
        this.view.setText('bar');
    }

    @on(RenderEvent)
    actionRender(event: MountEvent) {
        console.log('both!', event)
    }
}