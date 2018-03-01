import {
    pagerItem,
    onHover,
    __link as pager__link,
    __item_leading as pager__item_leading,
    __item as pager__item
} from "./__item/pager__item";

$(document).ready(() => {
    let pagers = $(".pager");

    let get_offset = function(pager) {
        let items = $(pager).find(pager__item);

        if (items.length >= 2) {
            let first_offset    = $(items[0]).offset().left;
            let second_offset   = $(items[1]).offset().left;

            return Math.abs(first_offset - second_offset);
        } else {
            return 0;
        }
    };

    let get_leading = function(pager) {
        let leadings = $(pager).find(pager__item_leading);
        if (leadings.length === 0) {return null}

        return leadings[0];
    };

    let impose_items = function(pager, leading) {
        let prevs = $(leading).prevAll();
        let nexts = $(leading).nextAll();

        let idx_leading = 9999;

        // console.log(nexts);

        $(leading).css({"z-index": idx_leading});

        let idx = idx_leading;
        for (let prev of prevs) {
            idx--;
            $(prev).css({"z-index": idx});
        }

        idx = idx_leading;
        for (let next of nexts) {
            idx--;
            $(next).css({"z-index": idx});
        }
    };

    let displace_items = function(items) {
        let items_count = items.length;

        let idx = 0;
        for (let item of items) {
            $(item).css({
                // "margin-left": 5,
                // "margin-right": 0,
            });

            idx++;
        }
    };

    let displace_links = function(items) {
        for (let item of items) {
            let link = $(item).find(pager__link)[0];

            let item_w = $(item).width();
            let link_w = $(link).width();

            let bias = -Math.abs(item_w - link_w) / 2;

            $(link).css({left: bias});
        }
    };

    let on_resize = function(pager) {
        let items = $(pager).find(pager__item);
        let leading = get_leading(pager);

        if (leading) {
            impose_items(pager, leading);
        }

        displace_items(items);
        displace_links(items);
    };

    $(window).resize(function () {
        for (let pager of pagers) {
            on_resize(pager);

            $(pager).data("offset", get_offset(pager));
        }

    });

    let on_hover_in = (leading) => {
        let pager_p = $(leading).closest(".pager");

        // console.log('in', leading);
        impose_items(pager_p, leading);

        // on_resize(pager_p);
    };

    let on_hover_out = (leading) => {
        let pager_p = $(leading).closest(".pager");

        let leading_orig = get_leading(pager_p);

        impose_items(pager_p, leading_orig);

        // on_resize(pager_p);
    };

    onHover(on_hover_in, on_hover_out);
    pagerItem();
    $(window).resize();
});
