export class ConfigurationError extends Error {
    constructor(m: string) {super(m); Object.setPrototypeOf(this, ConfigurationError.prototype);}
}