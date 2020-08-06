import AsynchronousModel, {listen} from "../core/base/model/AsynchronousModel";
import {ModelState} from "../core/base/model/Model";

type Plate = {
    id: number;
    type: string;
    orientation: string;
    x: number,
    y: number,
}

type Current = {

}

interface BreadboardModelState extends ModelState {
    plates: Plate[];
    currents: Current[];
}

export default class BreadboardModel extends AsynchronousModel<BreadboardModelState> {
    send(): void {

    }

    @listen('plates')
    private onPlates(plates: Plate[]) {
        this.state.plates = plates;
        console.log(plates);
    }

    @listen('currents')
    private onCurrents(currents: Current[]) {
        this.state.currents = currents;
        console.log(currents);
    }
}