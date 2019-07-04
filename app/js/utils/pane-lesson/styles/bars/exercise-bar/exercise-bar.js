const BAR_OFFSET_Y = 10;
const BAR_OVERFLOWN_OFFSET_X = 10;

let exerciseBarStyle = (container, bar_id) => {
    let $container = $(container);
    let $exercise = $(`#${bar_id}`);

    $container.on("contextmenu", function(evt) {
        //if (evt.which !== 3) return;

        evt.preventDefault();

        let offset = $container.offset();

        if (offset.left + $exercise.width() > $(document).width()) {
            offset.left = $(document).width() - $exercise.width() - BAR_OVERFLOWN_OFFSET_X;
        }

        $exercise.css({
            top: offset.top + $container.height() + BAR_OFFSET_Y,
            left: offset.left
        })

        $(`.exercise-bar:not(#${bar_id})`).hide();
        $exercise.fadeIn(100);
    });

    $(document).on("mousedown", function(evt) {
        // if the target of the click isn't the container nor a descendant of the container
        if (!$container.is(evt.target) && $container.has(evt.target).length === 0)
        {
            $exercise.fadeOut(100);
        }
    });
}


export default exerciseBarStyle
