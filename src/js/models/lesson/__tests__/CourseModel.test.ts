import EventService from "~/js/core/services/EventService";
import HttpDatasource from "~/js/core/base/model/datasources/HttpDatasource";
import CourseModel, {Course} from "../CourseModel"

jest.mock("~/js/core/base/model/datasources/HttpDatasource");

const courses_sample = [
  {
    pk: 0,
    fields: {
      name: 'test',
      description: 'test desc',
    },
    lessons: [
      { pk: 0, fields: { name: 'lesson0', description: 'desc' } },
      { pk: 1, fields: { name: 'lesson1', description: 'desc' } }
    ]
  }
]

describe('CourseModel', () => {
  const es = new EventService();

  let instance: CourseModel;
  let ds: HttpDatasource;

  beforeAll(() => {
    // @ts-ignore
    HttpDatasource.mockImplementation(() => {
      return {
        request: async (): Promise<any[]> => {return courses_sample}
      }
    })
  });

  beforeEach(() => {
    ds = new HttpDatasource('void');
    instance = new CourseModel(ds, es);
  });

  it('instance should get all lessons as an array', async () => {
    expect(instance).toBeInstanceOf(CourseModel);

    const lessons = await instance.list();

    for (const lesson of lessons) {
      expect(lesson).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          description: expect.any(String),
          lessons: expect.arrayContaining([expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            description: expect.any(String)
          })])
        })
      )
    }
  })

  it('processes lessons correctly', () => {
    const lesson_orig = courses_sample[0].lessons[0];
    const lesson = CourseModel.processLesson(lesson_orig);

    expect(lesson.id).toBe(lesson_orig.pk);
    expect(lesson.name).toBe(lesson_orig.fields.name);
    expect(lesson.description).toBe(lesson_orig.fields.description);
  })

  it('processes courses correctly', () => {
    const course_orig = courses_sample[0];
    const course = CourseModel.processCourse(course_orig);

    expect(course.id).toBe(course_orig.pk);
    expect(course.name).toBe(course_orig.fields.name);
    expect(course.description).toBe(course_orig.fields.description);
    expect(course.lessons).toHaveLength(course_orig.lessons.length);

    for (const idx of course.lessons.keys()) {
      expect(course.lessons[idx].id).toBe(course_orig.lessons[idx].pk);
      expect(course.lessons[idx].name).toBe(course_orig.lessons[idx].fields.name);
      expect(course.lessons[idx].description).toBe(course_orig.lessons[idx].fields.description);
    }
  })
})