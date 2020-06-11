import {IConfig} from "../helpers/IConfig";
import {View} from "../base/View";

export class ViewConfig implements IConfig {
    views: {[key: string]: typeof View} = {};

    constructor(config: object) {
        for (const [alias, view] of Object.entries(config)) {
            this.views[alias] = view;
        }
    }

    preprocess(): void {
        // do nothing
    }
}