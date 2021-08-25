import SVG from "svg.js";

import Grid from "../Grid";
import Layer from "../Layer"

jest.mock("svg.js")

console.log(mocked(SVG, true));


class DummyHTMLLayer extends Layer<HTMLDivElement> {
    compose() { }
}

class DummySVGLayer extends Layer {
    compose() { }
}

describe("Layer", () => {
    describe("extended by SVG-aware class", () => {
        let layer: Layer, grid: Grid, container;

        beforeAll(() => {
            container = SVG(document.body);
            console.log(container);
            
            grid = new Grid(2, 2, 2, 2);
            layer = new DummySVGLayer(container, grid);
        });

        describe("hide", () => {
            it("makes SVG containers hidden", () => {
                layer.hide();

                expect(container.node.style.display).toBe('none');
            });
        })
    });

    describe("extended by HTML-aware class", () => {
        let layer: Layer<HTMLDivElement>, grid: Grid, container;

        beforeAll(() => {
            container = document.createElement("div");
            grid = new Grid(2, 2, 2, 2);
            layer = new DummyHTMLLayer(container, grid);
        });

        describe("hide", () => {
            it("makes HTML containers hidden", () => {
                layer.hide();

                expect(container.style.visibility).toBe('hidden');
            });
        });
        describe("show", () => {
            it("makes HTML containers visible", () => {
                layer.show();

                expect(container.style.visibility).toBe('visible');
            });
        });

        describe("toggle", () => {
            it("calls 'show' when toggled on", () => {
                let spy = jest.spyOn(layer, 'show');

                layer.toggle(true);

                expect(spy.mock.calls.length).toBe(1);
            });

            it("calls 'hide' when toggled off", () => {
                let spy = jest.spyOn(layer, 'hide');

                layer.toggle(false);

                expect(spy.mock.calls.length).toBe(1);
            })
        });

    })
})