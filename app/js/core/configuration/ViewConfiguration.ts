import {IConfiguration} from "../helpers/IConfiguration";
import {View} from "../ui/View";

export class ViewConfiguration implements IConfiguration {
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