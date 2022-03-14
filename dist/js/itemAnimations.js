const itemAnimations = {}

itemAnimations[ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT] = {
    onFail: ($item, $target) => {
        playSound('fail');

        const gameData = GAMES[CURRENT_STATE.currentGameIndex];

        if (gameData.targetConfigs.shakeTargetImg) {
            animateCSS($target.find('.target-label img'), 'shakeX');
        } else {
            animateCSS($target, 'shakeX');
        }
    },
    onSuccess: ($item, $target) => {
        playSound('success');

        $item.css({
            transform: 'translateX(0)',
            transition: 'transform 1.3s',
        });

        $item.animate({
            top: $target.offset().top + $target.height() / 2 - $item.height() / 2,
            left: $target.offset().left + $target.width() / 2 - $item.width() / 2,
        }, 1000, 'swing', () => {
            animateCSS($item, 'zoomOut')
                .then(() => {
                    $item.remove();
                    renderNextWord();
                });
        });
    }
};

itemAnimations[ANIMATION_MOVE_TO_ITEM_AND_FIREWORK] = {
    onFail: ($item, $target) => {
        playSound('fail');
        animateCSS($target, 'shakeX');
    },
    onSuccess: ($item, $target) => {
        playSound('fireworksStart');

        const $targetsContainer = $gameContainer.find('.targets-container');

        $targetsContainer.find('.target[data-target-value!="' + $target.data('target-value') + '"]').hide();
        $target.find('span').remove();
        $target.css({
            width: $target.width(),
            height: $target.height(),
        });
        $target.css({'position': 'fixed'});

        $target.css({
            transform: 'translateX(0)',
            transition: 'transform 1.3s',
        });

        $target.click(function (event) {
            event.stopImmediatePropagation();
        });

        $item.animate({
            opacity: 0,
        }, 400, 'swing');

        const itemTop = $item.offset().top;
        const itemLeft = $item.offset().left;

        $target.animate({
            top: itemTop + $item.height() / 2,
            left: itemLeft + $item.width() / 2,
            width: 0,
            height: 0,
            opacity: 0.2,
        }, 1000, 'swing', () => {
            $item.remove();
            const $targetImg = $target.find('img');

            $target.css({
                top: itemTop,
                left: itemLeft,
            });
            $targetImg.css({
                width: '100%',
                height: 'auto',
            });

            stopSound('fireworksStart');

            $targetImg.attr('src', null);
            $targetImg.attr('src', 'dist/images/other/firework.gif');

            $target.css('opacity', 1);
            $target.css('width', '25%');
            $target.css('transition', 'none');

            playSound('fireworksExplode');

            setTimeout(() => {
                $target.animate({
                    opacity: 0
                }, 400, 'swing', () => {
                    stopSound('fireworksExplode');

                    $target.remove();
                    renderTargets();
                    renderNextWord();
                });
            }, 3000);
        });
    }
};