type ExcludeMethods<T> =
    Pick<T, { [K in keyof T]: T[K] extends (_: any) => any ? never : K }[keyof T]>;

export default abstract class DTO<T> {
    public constructor(initializer?: Partial<T>) {
        Object.assign(this, initializer);
    }
}