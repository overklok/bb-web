import IModelService from "./IModelService";
import {IRouter, Route} from "../../base/Router";
import IEventService from "./IEventService";
import { NotImplementedError } from "../../helpers/exceptions/notimplemented";

/**
 * @category Core
 * @subcategory Service
 */
export default class IRoutingService {
    setup(svc_model: IModelService, svc_event: IEventService)       {throw new NotImplementedError("abstract");}
    setRouter(router_class: IRouter)                                {throw new NotImplementedError("abstract");}
    loadRoutes(routes: Route<any>[])                                {throw new NotImplementedError("abstract");}
    launch()                                                        {throw new NotImplementedError("abstract");}
    forward(route_name: string, params: any[], override: boolean)   {throw new NotImplementedError("abstract");}
}