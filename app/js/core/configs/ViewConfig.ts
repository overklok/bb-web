import {IConfig} from "../helpers/IConfig";
import {View} from "../base/View";
import Presenter from "../base/Presenter";

interface IViewAssoc {
    view_type: typeof View;
    presenter_types: typeof Presenter[];
}

export class ViewConfig implements IConfig {
    views: {[key: string]: IViewAssoc} = {};

    constructor(config: object) {
        for (const [alias, view_assoc] of Object.entries(config)) {
            this.views[alias] = <IViewAssoc>view_assoc;
        }
    }

    preprocess(): void {}
}