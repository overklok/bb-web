/**
 * @abstract
 */
import {LayoutConfig} from "../../configs/LayoutConfig";
import {ViewConfig} from "../../configs/ViewConfig";

export default class ILayoutService {
    public setup(config_layout: LayoutConfig,
                 config_views: ViewConfig)          {throw new Error('abstract')};
    public compose(element: HTMLElement)            {throw new Error('abstract')};
    public switch(mode: string)                     {throw new Error('abstract')};
}