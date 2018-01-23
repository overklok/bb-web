import Wrapper from '../core/Wrapper'

import Blockly from 'node-blockly/browser'

class BlocklyWrapper extends Wrapper {
    constructor() {
        super();

        this.area          = undefined;
        this.container     = undefined;
        this.toolbox       = undefined;
        this.workspace     = undefined;
    }

    inject(dom_node) {
        this.area        = dom_node;
        this.container   = document.createElement('div');
        this.toolbox     = document.createElement('div');

        this.container.setAttribute("id", "blockly-div");
        this.toolbox.setAttribute("id", "blockly-toolbox");

        dom_node.appendChild(this.container);
        dom_node.appendChild(this.toolbox);

        this.workspace = Blockly.inject(this.container, {toolbox: this.toolbox});

        // window.addEventListener('resize', this._onResize, false);

        this._onResize();

        Blockly.svgResize(this.workspace);
    }

    takeout() {
        this.workspace.dispose();
        this.container.remove();
        this.toolbox.remove();

        // window.removeEventListener('resize', this._onResize, false);
    }

    /**
     * Изменить размер среды Blockly
     *
     * https://developers.google.com/blockly/guides/configure/web/resizable
     */
    _onResize() {
        this.container.style.width   = (this.area.offsetWidth - 20) + 'px';
        this.container.style.height  = (this.area.offsetHeight - 20) + 'px';
        Blockly.svgResize(this.workspace);
    }
}

export default BlocklyWrapper;