import Popup from "../core/Popup";
import Current from "../core/Current";
import { invertHexRGB } from "../core/extras/helpers";

export type CurrentPopupContent = {
    weight: number;
    weight_norm: number;
}

/**
 * Popup that displays when the cursor hovers a {@link Current} 
 */
export default class CurrentPopup extends Popup<CurrentPopupContent> {
    /**
     * Updates the content of current popup 
     * 
     * @param content details for the popup
     */
    public updateContent(content: CurrentPopupContent): void {
        this._container.style.visibility = content.weight ? 'visible' : 'hidden';

        const rgb = Current.pickColorFromRange(content.weight_norm);

        this._container.style.backgroundColor = rgb;
        this._container.style.color = invertHexRGB(rgb, true);
        this._container.innerHTML = `weight: ${content.weight}`;
    }

    protected __draw__(content: CurrentPopupContent): void {
        this.updateContent(content);
    }
}