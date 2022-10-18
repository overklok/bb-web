import Popup from "../core/Popup";
import Current from "../core/Current";
import { invertHexRgb } from "../core/extras/helpers";

export type VoltagePopupContent = {
    weight: number;
    weight_norm: number;
};

/**
 * Popup that displays when the cursor hovers a {@link Current}
 */
export default class VoltagePopup extends Popup<VoltagePopupContent> {
    /**
     * Updates the content of current popup
     *
     * @param content details for the popup
     */
    public updateContent(content: VoltagePopupContent): void {
        this._container.style.visibility = content.weight
            ? "visible"
            : "hidden";

        const rgb = Current.pickColorFromRange(content.weight_norm);

        this._container.style.backgroundColor = rgb;
        this._container.style.color = invertHexRgb(rgb, true);
        this._container.innerHTML = `weight: ${content.weight}`;
    }

    protected __draw__(content: VoltagePopupContent): void {
        this.updateContent(content);
    }
}
