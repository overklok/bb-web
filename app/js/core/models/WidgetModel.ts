import {View} from "../base/View";
import Presenter from "../base/Presenter";
import Model from "../base/Model";

interface IWidget {
    view_type: typeof View;
    presenter_types: typeof Presenter[];
}

export class WidgetModel extends Model {
    views: {[key: string]: IWidget} = {};

    constructor() {
        super();

        // for (const [alias, view_assoc] of Object.entries(config)) {
        //     this.views[alias] = <IViewAssoc>view_assoc;
        // }
    }

    preprocess(): void {}
}