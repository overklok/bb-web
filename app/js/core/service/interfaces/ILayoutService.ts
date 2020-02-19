import IBindable from "../../helpers/IBindable";
import LayoutConfiguration from "../../layout/interfaces/LayoutConfiguration";

/**
 * @abstract
 */
export default class ILayoutService {
    public setup(config: LayoutConfiguration)   {throw new Error('abstract')};
    public compose()                            {throw new Error('abstract')};
}