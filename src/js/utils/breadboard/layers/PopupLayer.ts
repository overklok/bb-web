import Grid from "../core/Grid";
import Layer from '../core/Layer';
import Popup, { PopupContent } from '../core/Popup';
import { XYObject } from '../core/types';

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

    private _mousepos: XYObject;

    /** active popup */
    private _popup: Popup<any>;

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
        
        this._popup = undefined;
    }

    public compose() { 
        this._container.parentElement.onmousemove = ((evt: MouseEvent) => {
            this._mousepos = {
                x: evt.clientX,
                y: evt.clientY
            };

            this._updateActivePopupPosition();
        });
    }

    /**
     * Draws externally instantiated {@link Popup} instance to the layer container
     * 
     * To display the popup {@link showPopup} call should be requested by another layer
     * 
     * This method is intended to call from the {@link Layer}'s popup draw request function
     * 
     * @param popup     the {@link Popup} instantiated in another layer
     * @param content   the content for the {@link Popup} needed to display
     */
    public drawPopup<C extends PopupContent>(popup: Popup<C>, content: C) {
        const container_popup = popup.draw(content);
        this._container.appendChild(container_popup);
    }

    /**
     * Clears externally instantiated {@link Popup} instance drawn on the layer container
     * 
     * This method is intended to call from the {@link Layer}'s popup draw request function
     * 
     * @param popup the {@link Popup} instantiated in another layer
     */
    public clearPopup(popup: Popup<any>) {
        popup.hide(() => popup.clear());
    }

    /**
     * Shows externally instantiated {@link Popup} instance drawn on the layer container
     *
     * @param popup the {@link Popup} instantiated in another layer
     */
    public showPopup<C extends PopupContent>(popup: Popup<C>) {
        // make active then update its position
        this._popup = popup;
        this._updateActivePopupPosition();

        popup.show();
    }

    /**
     * Hides externally instantiated {@link Popup} instance drawn on the layer container
     * 
     * This method does not remove the popup from the DOM.
     * To remove the popup {@link clearPopup} call should be requested by another layer
     * 
     * @param popup the {@link Popup} instantiated in another layer
     */
    public hidePopup(popup: Popup<any>) {
        popup.hide();

        this._popup = undefined;
    }

    /**
     * Updates position of the popup which is currently active
     */
    private _updateActivePopupPosition() {
        if (!this._popup) return; 

        this._popup.container.style.left = `${this._mousepos.x + PopupLayer.PositionOffset}px`;
        this._popup.container.style.top = `${this._mousepos.y + PopupLayer.PositionOffset}px`;
    }
}