import Presenter, {on} from "~/js/core/base/Presenter";
import HomeView from "~/js/views/common/HomeView";
import CourseModel from "~/js/models/lesson/CourseModel";
import ProgressModel from "~/js/models/lesson/ProgressModel";
import SettingsModel from "~/js/core/models/SettingsModel";
import {RequestErrorEvent} from "~/js/core/models/HttpModel";

import i18next from 'i18next';

export default class MenuLessonPresenter extends Presenter<HomeView.HomeView> {
    private course: CourseModel;
    private settings: SettingsModel;
    private progress: ProgressModel;
    load_handle: ReturnType<typeof setTimeout>;

    public getInitialProps() {
        this.course = this.getModel(CourseModel);
        this.settings = this.getModel(SettingsModel);
        this.progress = this.getModel(ProgressModel);

        this.loadCourses();

        document.title = `Tapanda | Main menu`;

        return {
            lang: this.settings.getChoiceSingle("general.language"),
            lang_options: this.settings.getSetting("general", "language").choices
        }
    }

    @on(HomeView.LessonSelectEvent)
    private forwardLesson(evt: HomeView.LessonSelectEvent) {
        this.forward('lesson', [evt.lesson_id]);
    }

    @on(HomeView.LanguageChangeEvent)
    private setLanguage(evt: HomeView.LanguageChangeEvent) {
        this.settings.setValue("general.language", evt.lang);
    }

    @on(RequestErrorEvent)
    private showError(evt: RequestErrorEvent) {
        this.setViewProps({
            error: i18next.t("main:home.error.no_server_access")
        });

        this.load_handle = setTimeout(() => {
            this.loadCourses();
        }, 2000);
    }

    private loadCourses() {
        const lesson_id = this.progress.getState().lesson_id;
        this.course.list().then((courses) => {
            clearTimeout(this.load_handle);
            this.setViewProps({ error: null, courses, lesson_id });
        });
    }
}