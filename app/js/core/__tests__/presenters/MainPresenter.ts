import Presenter, {on} from "../../base/Presenter";
import TestView, {ClickEvent} from "../views/TestView";
import {AbstractEvent} from "../../base/Event";

export default class MainPresenter extends Presenter {
    public static viewtype = TestView;

    constructor(view: TestView) {
        super(view);
    }

    @on(AbstractEvent)
    actionIndex() {
        console.log('click');
        console.log(AbstractEvent.name)
    }
}