import Popup from "../core/Popup";
import { invertHexRgb } from "../core/extras/helpers";

export type VoltagePopupContent = {
    voltage: number;
};

/**
 * Popup that displays when the cursor hovers a zone on {@link VoltageLayer}
 */
export default class VoltagePopup extends Popup<VoltagePopupContent> {
    /**
     * Updates the content of current popup
     *
     * @param content details for the popup
     */
    public updateContent(content: VoltagePopupContent): void {
        this._container.style.visibility = content.voltage
            ? "visible"
            : "hidden";

        const rgb = "#aa0000";

        this._container.style.backgroundColor = rgb;
        this._container.style.color = invertHexRgb(rgb, true);
        this._container.innerHTML = `Voltage: ${content.voltage} V`;
    }

    protected __draw__(content: VoltagePopupContent): void {
        this.updateContent(content);
    }
}
