import '../styles/popup.css';

export type PopupContent = any;

/**
 * Basic popup drawer
 *
 * @category Breadboard
 */
export default abstract class Popup<C extends PopupContent> {
    /** Root HTML container */
    protected _container: HTMLDivElement;

    // CSS class of the root container of the popup
    static Class = "bb-popup"

    // Popup fade in/out transition time
    static TransitionTime = 100

    /** 
     * Identifier of the object that called the 
     * menu to refer it on further handling 
     */
    private _caller_id: number;

    /**
     * Creates an instance of Popup
     * 
     * An optional arbitrary caller object ID can be provided 
     * 
     * @param item_id an arbitrary optional caller object identifier
     */
    constructor(item_id?: number) {
        this._container = undefined;
        this._caller_id = item_id;
    }

    /** 
     * Publicly accessible root HTML container of the {@link Popup}
     */
    public get container(): HTMLDivElement {
        if (!this._container) { throw new Error("Popup isn't still drawn") }

        return this._container;
    }

    /**
     * Renders {@link Popup} contents to DOM
     * 
     * This method returns the root HTML container where the contents is drawn
     * 
     * @param content
     */
    public draw(content: C): HTMLDivElement {
        this._container = document.createElement('div');
        this._container.setAttribute('id', `popup-${this._caller_id}`);
        this._container.classList.add('bb-popup', 'bb-popup_hidden');

        this.__draw__(content);
    
        this._container = this._container;
        this._container.style.opacity = '0';

        return this._container;
    }

    /**
     * Hides popup with animation
     * 
     * An additional callback is required to pass. It will be called
     * when the animation ends, so the popup can be removed from the DOM.
     * 
     * Transition time is defined by the {@link TransitionTime} value.
     * 
     * @param cb_hidden callback which will be called when the popup will be actually hidden.
     */
    public hide(cb_hidden?: Function): void {
        this._container.style.opacity = '0';

        setTimeout(() => {
            cb_hidden && cb_hidden();
        }, Popup.TransitionTime);
    }

    /**
     * Shows popup with animation
     * 
     * An additional callback is required to pass. It will be called
     * when the animation ends, so the popup can be removed from the DOM.
     * 
     * Transition time is defined by the {@link TransitionTime} value.
     * 
     * @param cb_hidden callback which will be called when the popup will be actually hidden.
     */
    public show(cb_shown?: Function): void {
        this._container.style.opacity = '1';

        setTimeout(() => {
            cb_shown && cb_shown();
        }, Popup.TransitionTime);
    }

    /**
     * Removes all content drawn by the {@link draw} method
     */
    public clear(): void {
        // while(this._container.firstChild) {
        //     this._container.removeChild(this._container.firstChild);
        // }

        this._container.remove();
    }

    public abstract updateContent(content: C): void;

    protected abstract __draw__(content: C): void;
}