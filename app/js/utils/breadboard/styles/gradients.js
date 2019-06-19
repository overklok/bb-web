const GRADIENTS = {
    GOLD: {
        VERT: undefined,
        HORZ: undefined,
        RADIAL: undefined,
    },
    SILVER: {
        HORZ: undefined,
        RADIAL: undefined,
    },
};

function initGradients(svg_node) {
    GRADIENTS.SILVER.HORZ = svg_node.gradient('linear', function(stop) {
        stop.at(.0, '#72706E');
        stop.at(.05,'#8D8C8C');
        stop.at(.1, '#AAABAA');
        stop.at(.2, '#DFE0DF');
        stop.at(.8, '#DFE0DF');
        stop.at(.9, '#AAABAA');
        stop.at(.95,'#8D8C8C');
        stop.at(1,  '#72706E');
    }).from(1, 0.5).to(0, 0.5);

    GRADIENTS.SILVER.RADIAL = svg_node.gradient('radial', function(stop) {
        stop.at(.0, '#A4A5A4');
        stop.at(.05,'#AAABAA');
        stop.at(.1, '#DFE0DF');
        stop.at(.9, '#DFE0DF');
        stop.at(.95,'#AAABAA');
        stop.at(1,  '#A4A5A4');
    });

    GRADIENTS.GOLD.VERT = svg_node.gradient('linear', function(stop) {
        stop.at(.0, '#BB772C');
        stop.at(.7, '#DBAB1D');
        stop.at(1,  '#BB772C');
    }).from(0.5, 1).to(0.5, 0);

    GRADIENTS.GOLD.HORZ = svg_node.gradient('linear', function(stop) {
        stop.at(.0, '#BB772C');
        stop.at(.7, '#DBAB1D');
        stop.at(1,  '#BB772C');
    }).from(1, 0.5).to(0, 0.5);

    GRADIENTS.GOLD.RADIAL = svg_node.gradient('radial', function(stop) {
        stop.at(.0, '#c28b2b');
        stop.at(.4, '#c28b2b');
        stop.at(1, '#DBAB1D');
    });
}

export {
    GRADIENTS,
    initGradients
}