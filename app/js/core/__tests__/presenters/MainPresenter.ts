import Presenter, {on} from "../../base/Presenter";
import TestView, {ClickEvent} from "../views/TestView";

export default class MainPresenter extends Presenter {
    public static viewtype = TestView;

    constructor(view: TestView) {
        super(view);
    }

    @on(ClickEvent)
    actionIndex(event: ClickEvent) {
        console.log('click', event);
    }
}