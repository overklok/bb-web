/**
 * @abstract
 */
import {LayoutConfiguration} from "../../configuration/LayoutConfiguration";

export default class ILayoutService {
    public setup(config: LayoutConfiguration)   {throw new Error('abstract')};
    public compose(element: HTMLElement)        {throw new Error('abstract')};
    public switch(mode: string)                 {throw new Error('abstract')};
}