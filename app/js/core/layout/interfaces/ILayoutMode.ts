/**
 * Режим разметки
 *
 * Режим определяет то, как и какие панели размещены в разметке.
 */
import ILayoutPane from "./ILayoutPane";

export default interface ILayoutMode {
    panes: ILayoutPane[];
}