import Layer from "../core/Layer";

class BackgroundLayer extends Layer {
    static get Class() {return "bb-layer-background"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(BackgroundLayer.Class);

        this._domaingroup   = undefined;
        this._cellgroup     = undefined;
        this._logogroup     = undefined;
    }

    compose() {
        this._container
            .rect('99%', '99%') /// 99 из-за обрезания рамки
            .radius(20)
            .fill({color: "#efefef"})
            .stroke({color: "#c9c9c9", width: 8})
            .move(4, 4);

        this._drawLogo();
        this._drawDomains();
        this._drawCells();
    }

    _drawLogo() {
        this._logogroup = this._container.group().id("logogroup");

        let image = this._logogroup
            .nested();

        let text = this._logogroup
            .text("тапанда")
            .font({
                size: 80,
                weight: "bolder",
                stretch: "extra-condensed",
                family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                "letter-spacing": -2
            })
            .scale(1, 1.1);

        let flower = image.group();
        let leaf = flower.symbol();

        leaf.path(
            "M54.67,33.67l-.05-.09L54.26,33l-6.21,3.58A6.55,6.55,0,0,0,46,38.44c0,.18,0,.36,0,.54h0v7.11l0," +
            ".07.1-.06,6.16-3.56h0l.46-.29a6.5,6.5,0,0,0,1.92-8.58Zm-.74,4.56a5,5,0,0,1-2.36,3.07l-5,2.87a5.11,5.11," +
            "0,0,1,2.17-6.38l4.92-2.84A5,5,0,0,1,53.93,38.23Z"
        ).scale(4);

        flower.use(leaf).rotate(0, 32, 65.5);
        flower.use(leaf).rotate(60, 32, 65.5);
        flower.use(leaf).rotate(120, 32, 65.5);
        flower.use(leaf).rotate(180, 32, 65.5);
        flower.use(leaf).rotate(240, 32, 65.5);
        flower.use(leaf).rotate(300, 32, 65.5);

        flower.move(18,0);
        flower.scale(0.7);

        text.move(100 + 10, 10);

        this._logogroup.cx(100 + this.__grid.size.x / 2);
    }

    _drawCells() {
        this._cellgroup = this._container.group();

        for (let col of this.__grid.cells) {
            for (let cell of col) {
                this._drawCell(this._cellgroup, cell);
            }
        }

        this._cellgroup.move(100, 170);
    }

    _drawDomains() {
        this._domaingroup = this._container.group();

        let gradient_vert = this._domaingroup.gradient('linear', function(stop) {
            stop.at(.0, '#BB772C');
            stop.at(.7, '#DBAB1D');
            stop.at(1, '#BB772C');
        }).from(0.5, 1).to(0.5, 0);

        let gradient_horz = this._domaingroup.gradient('linear', function(stop) {
            stop.at(.0, '#BB772C');
            stop.at(.7, '#DBAB1D');
            stop.at(1, '#BB772C');
        }).from(1, 0.5).to(0, 0.5);

        for (let col of this.__grid.cells) {
            this._drawDomain(this._domaingroup, col[1], col[4], gradient_vert);
            this._drawDomain(this._domaingroup, col[5], col[8], gradient_vert);
        }

        this._drawDomain(this._domaingroup, this.__grid.cell(0,9), this.__grid.cell(9,9), gradient_horz);
        this._drawDomain(this._domaingroup, this.__grid.cell(0,10), this.__grid.cell(9,10), gradient_horz);

        this._domaingroup.move(100, 170);
    }

    /**
     *
     * @param {SVG.Container}   container
     * @param {Cell}            cell_from
     * @param {Cell}            cell_to
     * @param {SVG.Gradient}    color
     * @private
     */
    _drawDomain(container, cell_from, cell_to, color="#D4AF37") {
        let width = Math.abs(cell_from.pos.x - cell_to.pos.x) + cell_from.size.x;
        let height = Math.abs(cell_from.pos.y - cell_to.pos.y) + cell_from.size.y;

        container
            .rect(width, height)
            .move(cell_from.pos.x, cell_from.pos.y)
            .radius(10)
            .fill({color: color})
            .stroke({color: color})
    }

    _drawCell(container, cell) {
        container
            .rect(cell.size.x, cell.size.y)
            .move(cell.pos.x, cell.pos.y)
            .fill({color: "#D4AF37", opacity: 1})
            .stroke({color: "#6f6f6f", opacity: 0.5})
            .radius(10);

        container.path([
            ['M', 0, 0],
            ['M', cell.size.x * 1 / 3, 0], ['l', 0, cell.size.y],
            ['M', cell.size.x * 2 / 3, 0], ['l', 0, cell.size.y],
            ['M', 0, cell.size.y * 1 / 3], ['l', cell.size.x, 0],
            ['M', 0, cell.size.y * 2 / 3], ['l', cell.size.x, 0],
        ])
            .fill({opacity: 0})
            .stroke({color: "#FFF", width: 2, opacity: 0.4})
            .move(cell.pos.x, cell.pos.y);
    }
}

export default BackgroundLayer;