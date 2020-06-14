import {LayoutConfig} from "../../configs/LayoutConfig";
import {ViewConfig} from "../../configs/ViewConfig";
import Application from "../../Application";

/**
 * @abstract
 */
export default class IViewService {
    protected readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public setup(config_layout: LayoutConfig,
                 config_views: ViewConfig)                      {throw new Error('abstract')};
    public compose(element: HTMLElement)                        {throw new Error('abstract')};
    public switch(mode: string)                                 {throw new Error('abstract')};
}