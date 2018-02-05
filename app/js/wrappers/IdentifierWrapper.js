import Wrapper from "../core/Wrapper";

require("clientjs/dist/client.min");

class IdentifierWrapper extends Wrapper {
    constructor() {
        super();

        this._client = new ClientJS();
    }

    get fingerprint() {
        return this._client.getFingerprint();
    }

    get userAgent() {
        return this._client.getUserAgent();
    }

    get browser() {
        return this._client.getBrowser();
    }

    get browserVersion() {
        return this._client.getBrowserVersion();
    }

    get OS() {
        return this._client.getOS();
    }

    get OSVersion() {
        return this._client.getOSVersion();
    }
}

export default IdentifierWrapper;