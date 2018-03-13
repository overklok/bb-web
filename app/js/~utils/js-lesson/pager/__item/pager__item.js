const NEIGHBOUR_COUNT = 2;

const __item = ".pager__item";
const __link = ".pager__link";
const __item_leading = ".pager__item_leading";

let hover_cb_in = function() {console.warn("hover_cb_in is orphan")};
let hover_cb_out = function() {console.warn("hover_cb_out is orphan")};

let pagerItem = () => {
    let pager__item = $(__item);

    let set_opacity = function(elem, value) {
        $(elem).find(__link).css({"opacity": value});
    };

    let wide_item = function (elem, on=true, factor=1) {
        if (on) {
            let pager = $(elem).closest(".pager");
            let diff = parseFloat($(pager).data("offset")) / factor;

            $(elem).css({
                "padding-left": diff,
                "padding-right": diff,
            });
        } else {
            $(elem).css({
                "padding-left": 0,
                "padding-right": 0,
            });
        }
    };

    let on_hover_in = function() {
        hover_cb_in(this);
        wide_item(this, true, 4);
        // wide_item($(this).prev(), true, 2);
    };

    let on_hover_out = function() {
        hover_cb_out(this);
        wide_item(this, false, 4);
        // wide_item($(this).prev(), false, 2);
    };

    pager__item.hover(on_hover_in, on_hover_out);
};

let onHover = (fn_in, fn_out) => {
    hover_cb_in = fn_in;
    hover_cb_out = fn_out;
};

export {pagerItem, onHover, __link, __item_leading, __item}