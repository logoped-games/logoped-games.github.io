import {config} from './config.js';
import {gameUtils} from './utils.js';
import {soundManager} from './soundManager.js';

// Animation utilities
export const itemAnimations = {
    [config.ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT]: {
        onFail: (targetElement, gameData) => {
            soundManager.playSound('fail')

            // Add shake animation
            if (gameData.targetConfigs.shakeTargetImg) {
                gameUtils.animateCSS(targetElement.querySelector('.target-label img'), 'shakeX');
            } else {
                gameUtils.animateCSS(targetElement, 'shakeX');
            }
        },
        onSuccess: async (targetElement, gameData, currentState, renderNextWord, positionTargets) => {
            soundManager.playSound('success');

            const $item = $('.item');
            const $target = $(targetElement);
            await $item.css({
                transform: 'translateX(0)',
                transition: 'transform 1.3s',
            });

            await $item.animate({
                top: $target.offset().top + $target.height() / 2 - $item.height() / 2,
                left: $target.offset().left + $target.width() / 2 - $item.width() / 2,
            }, 1000, 'swing', () => {
                gameUtils.animateCSS($item, 'zoomOut', () => {
                    $item.removeAttr("style");
                    renderNextWord();
                });
            });
        }
    },
    [config.ANIMATION_MOVE_TO_ITEM_AND_FIREWORK]: {
        onFail: (targetElement, gameData) => {
            soundManager.playSound('fail')
            gameUtils.animateCSS(targetElement, 'shakeX');
        },
        onSuccess: async (targetElement, gameData, currentState, renderNextWord, positionTargets) => {
            soundManager.playSound('fireworksStart')

            const itemElement = document.querySelector('.item');
            if (!itemElement) {
                return;
            }

            // Hide other targets
            const targetsContainer = document.querySelector('.targets-container');
            const otherTargets = targetsContainer.querySelectorAll('.target');

            otherTargets.forEach(target => {
                if (target !== targetElement) {
                    target.style.display = 'none';
                }
            });

            // Remove target label
            const targetLabel = targetElement.querySelector('span');
            if (targetLabel) {
                $(targetLabel).hide();
            }

            // Store original position and size
            const originalRect = targetElement.getBoundingClientRect();

            // Set target position to fixed and preserve size
            targetElement.style.position = 'fixed';
            targetElement.style.width = originalRect.width + 'px';
            targetElement.style.height = originalRect.height + 'px';
            targetElement.style.left = originalRect.left + 'px';
            targetElement.style.top = originalRect.top + 'px';
            targetElement.style.zIndex = '1000';

            // Disable click events on target
            targetElement.style.pointerEvents = 'none';

            // Fade out item
            itemElement.style.transition = 'opacity 0.4s';
            itemElement.style.opacity = '0';

            // Get item position
            const itemRect = itemElement.getBoundingClientRect();

            // Move target to item position with animation
            targetElement.style.transition = 'all 1s ease';
            targetElement.style.left = (itemRect.left + itemRect.width / 2 - originalRect.width / 2) + 'px';
            targetElement.style.top = (itemRect.top + itemRect.height / 2 - originalRect.height / 2) + 'px';
            targetElement.style.width = '0px';
            targetElement.style.height = '0px';
            targetElement.style.opacity = '0.2';

            await gameUtils.sleep(1000);

            // Set up firework
            const targetImg = targetElement.querySelector('img');
            let oldSrc;

            if (targetImg) {
                oldSrc = targetImg.src;
                targetImg.src = 'images/other/firework.gif';
            }

            targetElement.style.left = itemRect.left + 'px';
            targetElement.style.top = itemRect.top + 'px';
            targetElement.style.width = '25%';
            targetElement.style.height = 'auto';
            targetElement.style.opacity = '1';
            targetElement.style.transition = 'none';
            targetElement.classList.add('firework');

            soundManager.pauseSound('fireworksStart')
            soundManager.playSound('fireworksExplode')

            await gameUtils.sleep(3000);
            targetElement.style.transition = 'opacity 0.4s';
            targetElement.style.opacity = '0';

            await gameUtils.sleep(400);
            soundManager.pauseSound('fireworksExplode')

            targetElement.classList.remove('firework');
            targetElement.style = 'opacity: 0';
            await gameUtils.sleep(300);
            targetElement.style = '';

            itemElement.style = '';

            targetImg.src = oldSrc;

            otherTargets.forEach(target => {
                if (target !== targetElement) {
                    target.style = '';
                }
            });

            $(targetLabel).show();

            renderNextWord();

            // Recalculate target positions after resetting styles
            if (positionTargets) {
                await gameUtils.sleep(100);
                positionTargets();
            }
        }
    }
};
