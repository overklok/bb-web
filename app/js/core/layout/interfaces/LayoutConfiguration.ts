import ILayoutMode from "./ILayoutMode";
import IConfiguration from "../../helpers/IConfiguration";

export default class LayoutConfiguration implements IConfiguration {
    modes: {[key: string]: ILayoutMode};
}