import Presenter, {action} from "../core/base/Presenter";
import BoardView from "../views/BoardView";

export default class BoardPresenter extends Presenter<BoardView> {
    // TODO: Move Actions declatarion to View but leave usage here
    protected static actions: Map<string, string> = new Map([
        ['mode', 'Установить режим'],
    ]);

    @action('okay')
    test() {
        console.log('okay 2231');
    }
}