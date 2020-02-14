import LayoutPane from "./LayoutPane";

/**
 * Режим разметки
 *
 * Режим определяет то, как и какие панели размещены в разметке.
 */
export default class LayoutMode {
    private panes: Map<string, LayoutPane>
}