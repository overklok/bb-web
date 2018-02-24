import Wrapper from "../core/Wrapper"

import base from "intro.js/introjs.css";
// import thm from "intro.js/themes/introjs-flattener.css";

let introJS = require('intro.js').introJs;
// window.introJS = introJS;

class TourWrapper extends Wrapper {
    constructor() {
        super();

        this._introJS = introJS();

        this._introJS.setOptions({
            steps: [
                {
                    intro: "Hello world!"
                },
                {
                    intro: "Hello world!"
                },
            ]
          });

        this._introJS.start();
    }
}

export default TourWrapper;
