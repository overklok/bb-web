import '../styles/popup.css';
import Grid from "../core/Grid";
import Layer from '../core/Layer';
import { XYObject } from '../core/types';
import Current from '../core/Current';
import { invertHexRGB } from '../core/extras/helpers';

/**
 * Contains popups called from other {@link Layer}s of the breadboard
 * 
 * Unlike most of the layers in the {@link Breadboard}, this layer is HTML-based. 
 * This is required because popups are HTML elements which can be mounted in HTML container only.
 * 
 * @category Breadboard
 * @subcategory Layers
 */
export default class PopupLayer extends Layer<HTMLDivElement> {
    /** CSS class of the layer */
    static get Class() {return "bb-layer-popup"}
    static get PositionOffset() {return 10}

    /** instances of popups currently opened */
    private _popups: {[id: number]: HTMLDivElement};
    /** active popup instance */
    private _popup: HTMLDivElement;

    private _mousepos: XYObject;

    /**
     * Make sure to pass an HTML container when constructing the layer.
     * Since the other layers all in the SVG, make sure that the container 
     * is placed over entire SVG document in the DOM tree and visible to user.
     * The container should allow any interactions outside the content it creates, but
     * prevent any background interactions under that content. 
     */
    constructor(
        container: HTMLDivElement,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.classList.add(PopupLayer.Class);

        this._popups = [];
        this._popup = undefined;

    }

    compose() { 
        this._container.parentElement.onmousemove = ((evt: MouseEvent) => {
            this._mousepos = {
                x: evt.clientX,
                y: evt.clientY
            };

            this._updateActivePopupPosition();
        });
    }

    /**
     */
    public createPopup(id: number, weight: number) {
        // TODO: Move Popup to separate class. Define content there in CurrentPopup
        const popup = document.createElement('div');
        popup.setAttribute('id', `popup-${id}`);
        popup.classList.add('bb-popup');

        const rgb = Current.pickColorFromRange(weight);
        popup.style.backgroundColor = rgb;
        popup.style.color = invertHexRGB(rgb, true);
        popup.innerHTML = `weight: ${weight}`;
        
        this._popups[id] = popup;
        this._popup = popup;

        this._updateActivePopupPosition();

        this._container.appendChild(popup);
    }

    /**
     */
    public updatePopup(id: number, weight: number) {
        if (!(id in this._popups)) throw new Error(`Popup ${id} does not exist`);

        const popup = this._popups[id];
        
        const rgb = Current.pickColorFromRange(weight);
        popup.style.backgroundColor = rgb;
        popup.style.color = invertHexRGB(rgb, true);
        popup.innerHTML = `weight: ${weight}`;
    }

    /**
     */
    public destroyPopup(id: number) {
        const popup = this._popups[id]

        delete this._popups[id];

        popup.classList.add('bb-popup_faded');
        setTimeout(() => popup.remove(), 300);

        this._popup = undefined;
    }

    private _updateActivePopupPosition() {
        if (!this._popup) return;

        this._popup.style.left = `${this._mousepos.x + PopupLayer.PositionOffset}px`;
        this._popup.style.top = `${this._mousepos.y + PopupLayer.PositionOffset}px`;
    }
}