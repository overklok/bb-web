import TestView from "../views/TestView";
import TestView2 from "../views/TestView2";
import MainPresenter from "../presenters/MainPresenter";

export default {
    test1: {view_type: TestView, presenter_types: [MainPresenter]},
    test2: {view_type: TestView2, presenter_types: []},
}