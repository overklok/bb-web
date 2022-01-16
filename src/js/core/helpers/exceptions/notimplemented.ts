export class NotImplementedError extends Error {
    constructor(m: string) {super(m); Object.setPrototypeOf(this, NotImplementedError.prototype);}
}