import EventService from "~/js/core/services/EventService";
import HttpDatasource from "~/js/core/base/model/datasources/HttpDatasource";
import {LaunchMode, Lesson} from "../LessonModel";
import ProgressModel from "../ProgressModel";

jest.mock("~/js/core/base/model/datasources/HttpDatasource");

const mission_defaults = {name: '', description: ''}

const exer_defaults = {
    name: 'exercise',
    is_sandbox: false,
    message_success: '',
    task_description: '',
    layout_mode: '',
    launch_mode: LaunchMode.DoNothing,
    popovers: [{id: 0, title: '', content: ''}],
    module_settings: {}
}

const lesson_full: Lesson = {
    id: 0,
    name: 'lesson',
    description: 'lesson desc',
    missions: [
        {
            id: 0,
            exercises: [
                { id: 212, ...exer_defaults, },
                { id: 262, ...exer_defaults, },
                { id: 222, ...exer_defaults, },
            ],
            ...mission_defaults
        },
        {
            id: 1,
            exercises: [
                { id: 882, ...exer_defaults, },
                { id: 832, ...exer_defaults, },
                { id: 842, ...exer_defaults, },
                { id: 852, ...exer_defaults, },
                { id: 862, ...exer_defaults, },
            ],
            ...mission_defaults
        },
        {
            id: 2,
            exercises: [
                { id: 332, ...exer_defaults, },
            ],
            ...mission_defaults
        },
        {
            id: 3,
            exercises: [
                { id: 132, ...exer_defaults, },
                { id: 192, ...exer_defaults, },
            ],
            ...mission_defaults
        },
    ]
}

const lesson_unit_missions_only = {
    id: 0,
    name: 'lesson',
    description: 'lesson desc',
    missions: [
        { id: 0, exercises: [ { id: 222, ...exer_defaults, }, ], ...mission_defaults },
        { id: 1, exercises: [ { id: 862, ...exer_defaults, }, ], ...mission_defaults },
        { id: 2, exercises: [ { id: 332, ...exer_defaults, }, ], ...mission_defaults },
        { id: 3, exercises: [ { id: 132, ...exer_defaults, }, ], ...mission_defaults },
    ]
}

describe('ProgressModel', () => {
    const es = new EventService();

    let model: ProgressModel;
    let ds: HttpDatasource;

    beforeEach(() => {
        ds = new HttpDatasource('void');
        model = new ProgressModel(ds, es);
        model.init(undefined);

        model.loadLesson(lesson_full, true);
    });

    it('resets indices on load', () => {
        const state = model.getState();

        expect(state.mission_idx).toBe(-1);
        expect(state.mission_idx_last).toBe(lesson_full.missions.length - 1);
        expect(state.mission_idx_passed).toBe(-1);
        expect(state.mission_idx_passed_max).toBe(-1);
        expect(state.mission_idx_available).toBe(0);

        for (const [idx, mission] of state.missions.entries()) {
            expect(mission.exercise_idx).toBe(0);
            expect(mission.exercise_idx_available).toBe(0);
            expect(mission.exercise_idx_passed).toBe(-1);
            expect(mission.exercise_idx_passed_max).toBe(-1);
            expect(mission.exercise_idx_last).toBe(lesson_full.missions[idx].exercises.length - 1);
        }
    });


})