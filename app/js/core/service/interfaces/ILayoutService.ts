/**
 * @abstract
 */
import {LayoutConfiguration} from "../../configuration/LayoutConfiguration";
import {ViewConfiguration} from "../../configuration/ViewConfiguration";

export default class ILayoutService {
    public setup(config_layout: LayoutConfiguration,
                 config_views: ViewConfiguration)   {throw new Error('abstract')};
    public compose(element: HTMLElement)            {throw new Error('abstract')};
    public switch(mode: string)                     {throw new Error('abstract')};
}