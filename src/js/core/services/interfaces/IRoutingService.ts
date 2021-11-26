import IModelService from "./IModelService";
import {IRouter, Route} from "../../base/Router";
import IEventService from "./IEventService";

/**
 * @category Core
 * @subcategory Service
 */
export default class IRoutingService {
    setup(svc_model: IModelService, svc_event: IEventService)       {throw new Error("abstract");}
    setRouter(router_class: IRouter)                                {throw new Error("abstract");}
    loadRoutes(routes: Route<any>[])                                {throw new Error("abstract");}
    launch()                                                        {throw new Error("abstract");}
    forward(route_name: string, params: any[], override: boolean)   {throw new Error("abstract");}
}