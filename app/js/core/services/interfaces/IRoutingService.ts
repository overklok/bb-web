import IModelService from "./IModelService";
import {IRouter, Route} from "../../base/Router";

export default class IRoutingService {
    setup(svc_model: IModelService)                         {throw new Error("abstract");}
    setRouter(router_class: IRouter)                        {throw new Error("abstract");}
    loadRoutes(routes: Route<any>[])                        {throw new Error("abstract");}
    launch()                                                {throw new Error("abstract");}
    forward(route_name: string, params: [])                 {throw new Error("abstract");}
}