import Presenter, {on, restore} from "../../core/base/Presenter";
import RichTextView from "../../views/common/RichTextView";
import {PopoverContentUpdateEvent} from "../../models/LessonModel";

export default class PopoverLessonPresenter extends Presenter<RichTextView.RichTextView> {
    @restore() @on(PopoverContentUpdateEvent)
    private showPopover(evt: PopoverContentUpdateEvent) {
        this.setViewProps({content: evt.content});
    }
}