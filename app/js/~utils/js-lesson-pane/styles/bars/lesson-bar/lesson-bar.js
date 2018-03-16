import {
    barItemStyle,
    onHover,
    __link as bar__link,
    __item_leading as bar__item_leading,
    __item as bar__item
} from "./__item/lesson-bar__item";

let lessonBarStyle = () => {
    let bars = $(".lesson-bar");

    let get_offset = function (bar) {
        let items = $(bar).find(bar__item);

        if (items.length >= 2) {
            let first_offset = $(items[0]).offset().left;
            let second_offset = $(items[1]).offset().left;

            return Math.abs(first_offset - second_offset);
        } else {
            return 0;
        }
    };

    let get_leading = function (bar) {
        let leadings = $(bar).find(bar__item_leading);
        if (leadings.length === 0) {
            return null
        }

        return leadings[0];
    };

    let impose_items = function (bar, leading) {
        let prevs = $(leading).prevAll();
        let nexts = $(leading).nextAll();

        let idx_leading = 9999;

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

    let displace_links = function (items) {
        for (let item of items) {
            let link = $(item).find(bar__link)[0];

            let item_w = $(item).width();
            let link_w = $(link).width();

            let bias = -Math.abs(item_w - link_w) / 2;

            $(link).css({left: bias});
        }
    };

    let on_resize = function (bar) {
        let items = $(bar).find(bar__item);
        let leading = get_leading(bar);

        if (leading) {
            impose_items(bar, leading);
        }

        displace_links(items);
    };

    $(window).resize(function () {
        for (let bar of bars) {
            on_resize(bar);

            $(bar).data("offset", get_offset(bar));
        }

    });

    let on_hover_in = (leading) => {
        let bar_p = $(leading).closest(".lesson-bar");

        impose_items(bar_p, leading);
    };

    let on_hover_out = (leading) => {
        let bar_p = $(leading).closest(".lesson-bar");

        let leading_orig = get_leading(bar_p);

        impose_items(bar_p, leading_orig);
    };

    onHover(on_hover_in, on_hover_out);
    barItemStyle();
    $(window).resize();
};

export default lessonBarStyle;