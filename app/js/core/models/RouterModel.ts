import Model from "../base/model/Model";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import {RouterEvent} from "../base/Event";

export interface Route {
    path: string;
    event_type: typeof RouterEvent;
}

export class RouterModelState {
    routes: { [route_name: string]: Route }
}

export default class RouterModel extends Model<RouterModelState, DummyDatasource> {
    defaultState = {
        routes: {}
    };

    init(state: Partial<RouterModelState>) {
        super.init(state);

        console.log('rm loaded');

        window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            e.returnValue = '';

            console.log('location changed!');
        });

        window.onbeforeunload = function() {
            return "";
        }
    }
}