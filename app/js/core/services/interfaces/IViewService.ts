import {LayoutConfig} from "../../configs/LayoutConfig";
import {ViewConfig} from "../../configs/ViewConfig";
import Presenter from "../../base/Presenter";
import Application from "../../Application";

/**
 * @abstract
 */
export default class IViewService {
    public setup(config_layout: LayoutConfig,
                 config_views: ViewConfig)                      {throw new Error('abstract')};
    public compose(element: HTMLElement)                        {throw new Error('abstract')};
    public switch(mode: string)                                 {throw new Error('abstract')};
    public registerPresenterType(presenter: typeof Presenter)   {throw new Error('abstract')};
}