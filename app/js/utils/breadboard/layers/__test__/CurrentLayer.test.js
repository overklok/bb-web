import SVG from "svgjs";
import CurrentLayer from "../CurrentLayer";
import Grid from "../../core/Grid";

jest.mock('../../core/Grid');

const brush = SVG(document.createElement("div"));

describe('CurrentLayer', () => {
    describe('doesIntersectionExist', () => {
        const layer = new CurrentLayer(brush, new Grid(10, 10, 1000, 1000));

        it('should return true', () => {
            expect(true).toBe(true);
        })
    });
});