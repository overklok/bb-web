import {LayoutConfiguration} from "../../layout/types";

/**
 * @abstract
 */
export default class ILayoutService {
    public setup(config: LayoutConfiguration)   {throw new Error('abstract')};
    public compose(element: HTMLElement)        {throw new Error('abstract')};
}