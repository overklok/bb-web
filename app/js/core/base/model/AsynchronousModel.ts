import Model from "./Model";
import AsynchronousDatasource from "./datasources/AsynchronousDatasource";

export function listen(channel: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // if (target.routes == null) {
        //     target.routes = new Map();
        // }

        // for (const event_type of event_types) {
        //     target.routes.set(event_type, propertyKey)
        // }

        return target;
    }
}

export default abstract class AsynchronousModel<MS> extends Model<MS, AsynchronousDatasource> {
    public readonly handlers: {[key: string]: Function[]}
}