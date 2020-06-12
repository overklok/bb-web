import Presenter from "../../base/Presenter";
import {View} from "../../base/View";

export default class ViewConnector {
    private readonly presenter_types: typeof Presenter[];
    private presenters: Presenter[];

    constructor(presenter_types?: typeof Presenter[]) {
        this.presenter_types = presenter_types == null ? [] : presenter_types;
        this.presenters = [];
    }

    activate(view: View) {
        for (const presenter_type of this.presenter_types) {
            this.presenters.push(new presenter_type(view));
        }
    }
}