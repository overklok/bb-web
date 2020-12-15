import Presenter, {on} from "../../core/base/Presenter";
import LessonMenuView from "../../views/common/LessonMenuView";
import CourseModel from "../../models/CourseModel";
import ProgressModel from "../../models/ProgressModel";
import {RequestErrorEvent} from "../../core/base/model/HttpModel";

export default class LessonMenuPresenter extends Presenter<LessonMenuView.LessonMenuView> {
    private course: CourseModel;
    private progress: ProgressModel;

    public async getInitialProps() {
        this.course = this.getModel(CourseModel);
        this.progress = this.getModel(ProgressModel);

        const lesson_id = this.progress.getState().lesson_id;

        this.course.list().then((courses) => {this.setViewProps({courses, lesson_id})});
    }

    @on(LessonMenuView.LessonSelectEvent)
    private forwardLesson(evt: LessonMenuView.LessonSelectEvent) {
        this.forward('lesson', [evt.lesson_id]);
    }

    @on(RequestErrorEvent)
    private showError(evt: RequestErrorEvent) {
        this.setViewProps({
            error: 'Ошибка'
        })
    }
}