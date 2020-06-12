import Presenter, {on} from "../../base/Presenter";
import Event from "../../base/Event";
import TestView from "../views/TestView";

export default class MainPresenter extends Presenter {
    public static viewtype = TestView;

    constructor(view: TestView) {
        super(view);
    }


    @on(Event)
    actionIndex() {

    }
}