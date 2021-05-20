import Grid from "../Grid";
import Cell from "../Cell";

const GRID_ROW_QTY = 10;
const GRID_COL_QTY = 7;
const GRID_WIDTH  = 100;
const GRID_HEIGHT = 100;
const GRID_POS_X    = 20
const GRID_POS_Y    = 80;
const GRID_GAP_X    = 2;
const GRID_GAP_Y    = 2;


describe('Grid', function() {
    // подготовим переменные для использования
    let Instance_Default = new Grid(
        GRID_ROW_QTY, GRID_COL_QTY, GRID_WIDTH, GRID_HEIGHT
    );

    let Instance_Full = new Grid(
        GRID_ROW_QTY, GRID_COL_QTY, GRID_WIDTH, GRID_HEIGHT,
        GRID_POS_X, GRID_POS_Y,
        GRID_GAP_X, GRID_GAP_Y
    );

    // формальная проверка на тип возвращаемой переменной
    it("Should be an function", function () {
        expect(Grid).to.be.an('function');
    });

    // после применения new на функции конструкторе - получим объект
    it("Instance should be an object", function() {
        expect(Instance_Default).to.be.an('object');
    });

    describe("#constructor()", function() {
        it("Should throw a TypeError if none of required argument values has been defined", function() {
            (() => new Grid()).should.throw(TypeError);
            (() => new Grid(null, null, null, null)).should.throw(TypeError);
            (() => new Grid(0, 0, 0, 0)).should.not.throw(TypeError);
        });

        it("Should throw a RangeError if required arguments has non-positive values", function () {
            (() => new Grid(1, 1, 0, 0)).should.throw(RangeError);
            (() => new Grid(0, 0, 1, 1)).should.throw(RangeError);

            (() => new Grid(1, 1, -20, 1)).should.throw(RangeError);
            (() => new Grid(-11241, 1, 1, 1)).should.throw(RangeError);
        });

        it("Should throw a RangeError if optional arguments has negative values", function () {
            (() => new Grid(1, 1, 1, 1, -10, 0, 0, 0)).should.throw(RangeError);
            (() => new Grid(1, 1, 1, 1, 0, 0, -1, -80012)).should.throw(RangeError);
        });
    });

    describe("#dim", function() {
        it("Should give correct value immediately after instantiating a grid", function() {
            let dim = Instance_Default.dim;

            expect(dim).to.have.all.keys(['x', 'y']);

            expect(dim.x).to.equal(GRID_COL_QTY);
            expect(dim.y).to.equal(GRID_ROW_QTY);
        });
    });

    describe("#size", function() {
        it("Should give correct value immediately after instantiating a grid", function() {
            let size = Instance_Default.size;

            expect(size).to.have.all.keys(['x', 'y']);

            expect(size.x).to.equal(GRID_WIDTH);
            expect(size.y).to.equal(GRID_WIDTH);
        });
    });

    describe("#gap", function() {
        it("Should give correct value immediately after instantiating a grid", function() {
            let gap_d = Instance_Default.gap;
            let gap_f = Instance_Full.gap;

            expect(gap_d).to.have.all.keys(['x', 'y']);
            expect(gap_f).to.have.all.keys(['x', 'y']);

            expect(gap_d.x).to.equal(0);
            expect(gap_d.y).to.equal(0);

            expect(gap_f.x).to.equal(GRID_GAP_X);
            expect(gap_f.y).to.equal(GRID_GAP_Y);
        });
    });

    describe("#pos", function() {
        it("Should give correct value immediately after instantiating a grid", function() {
            let pos_d = Instance_Default.pos;
            let pos_f = Instance_Full.pos;

            expect(pos_d).to.have.all.keys(['x', 'y']);
            expect(pos_f).to.have.all.keys(['x', 'y']);

            expect(pos_d.x).to.equal(0);
            expect(pos_d.y).to.equal(0);

            expect(pos_f.x).to.equal(GRID_POS_X);
            expect(pos_f.y).to.equal(GRID_POS_Y);
        });
    });

    describe("#cells", function() {
        it("Should give correct amount of rows and columns immediately after instantiating a grid", function() {
            let cells = Instance_Default.cells;

            expect(cells).to.have.lengthOf(GRID_COL_QTY);

            cells.forEach((row, idx) => expect(row instanceof Array, `cells[${idx}] is not an Array`).to.be.true);
            cells.forEach((row, idx) => expect(row).to.have.lengthOf(GRID_ROW_QTY));
        });

        it("All end items of Grid should have correct type", function () {
            let cells = Instance_Default.cells;

            cells.forEach((row, idx_x) => row.forEach((cell, idx_y) => expect(cell instanceof Cell).to.be.true));
        })
    });
});