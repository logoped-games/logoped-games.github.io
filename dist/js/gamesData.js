const BASE_TARGET_DIR = 'dist/images/targets';

function targetDecorator(img, appendDir = true, cssClass = null) {
    return {
        img: (appendDir ? (BASE_TARGET_DIR + "/") : '') + img,
        cssClass: cssClass,
    };
}

window.GAMES = [
    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/forest-1.jpg",
            position: "dist/images/thumbnails/position/forest-1.jpg",
        },
        background: "dist/images/backgrounds/forest1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["dist/images/item-backgrounds/raspberry.png"],
        },
        gameName: "forest-1",
        targetConfigs: {
            diff: [
                targetDecorator('bear.png'),
                targetDecorator('bear2.png'),
            ],
            position: [
                targetDecorator('bear.png'),
                targetDecorator('bear2.png'),
                targetDecorator('bear.png'),
            ],
        },
    },
    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/winter-1.jpg",
            position: "dist/images/thumbnails/position/winter-1.jpg",
        },
        background: "dist/images/backgrounds/winter1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        gameName: "winter-1",
        wordConfig: {
            backgrounds: ["dist/images/item-backgrounds/snowball.png"],
        },
        targetConfigs: {
            diff: [
                targetDecorator('snowman1.png'),
                targetDecorator('snowman2.png'),
            ],
            position: [
                targetDecorator('snowman1.png'),
                targetDecorator('snowman2.png'),
                targetDecorator('snowman3.png'),
            ]
        },
    },
    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/rocket-1.jpg",
            position: "dist/images/thumbnails/position/rocket-1.jpg",
        },
        background: "dist/images/backgrounds/night-town-2.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_ITEM_AND_FIREWORK,
        gameName: "rocket-1",
        wordConfig: {
            backgrounds: ["dist/images/item-backgrounds/square.png"],
        },
        targetConfigs: {
            diff: [
                targetDecorator('rocket1.png'),
                targetDecorator('rocket2.png'),
            ],
            position: [
                targetDecorator('rocket1.png'),
                targetDecorator('rocket2.png'),
                targetDecorator('rocket3.png'),
            ]
        },
    },
    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/forest-2.jpg",
            position: "dist/images/thumbnails/position/forest-2.jpg",
        },
        background: "dist/images/backgrounds/forest3.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["dist/images/item-backgrounds/suitcase-1.png"],
        },
        gameName: "forest-train-1",
        targetConfigs: {
            targetBackground: "dist/images/targets/train3.png",
            diff: [
                targetDecorator('dist/images/item-backgrounds/square.png', false),
                targetDecorator('dist/images/item-backgrounds/square.png', false),
            ],
            position: [
                targetDecorator('dist/images/item-backgrounds/square.png', false),
                targetDecorator('dist/images/item-backgrounds/square.png', false),
                targetDecorator('dist/images/item-backgrounds/square.png', false),
            ],
        },
    },

    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/winter-2.jpg",
            position: "dist/images/thumbnails/position/winter-2.jpg",
        },
        background: "dist/images/backgrounds/winter-4.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: [
                "dist/images/item-backgrounds/christmas-ball-green.png",
                "dist/images/item-backgrounds/christmas-ball-red.png",
            ],
        },
        gameName: "winter-christmas-tree-1",
        targetConfigs: {
            diff: [
                targetDecorator('christmas-tree-1.png'),
                targetDecorator('christmas-tree-1.png'),
            ],
            position: [
                targetDecorator('christmas-tree-1.png'),
                targetDecorator('christmas-tree-1.png'),
                targetDecorator('christmas-tree-1.png'),
            ],
        },
    },

    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/train-1.jpg",
            position: "dist/images/thumbnails/position/train-1.jpg",
        },
        background: "dist/images/backgrounds/train.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["dist/images/item-backgrounds/suitcase-1.png"],
        },
        gameName: "train-2",
        targetConfigs: {
            diff: [
                targetDecorator('dist/images/item-backgrounds/square.png', false),
                targetDecorator('dist/images/item-backgrounds/square.png', false),
            ],
            position: [
                targetDecorator('dist/images/item-backgrounds/square.png', false),
                targetDecorator('dist/images/item-backgrounds/square.png', false),
                targetDecorator('dist/images/item-backgrounds/square.png', false),
            ],
        },
    },

    {
        thumbnails: {
            diff: "dist/images/thumbnails/diff/boat-1.jpg",
            position: "dist/images/thumbnails/position/boat-1.jpg",
        },
        background: "dist/images/backgrounds/train.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["dist/images/item-backgrounds/lifebuoy.png"],
        },
        gameName: "sea-boat-1",
        customBlock: '<div class="boat-animation-wrapper">' +
            '  <div class="water">' +
            '   <ul class="waves">' +
            '    <li class="wave-one" style="background-image: url(\'dist/images/other/wave1.png\');"></li>' +
            '    <li class="wave-two" style="background-image: url(\'dist/images/other/wave2.png\');"></li>' +
            '    <li class="wave-three" style="background-image: url(\'dist/images/other/wave3.png\');"></li>' +
            '    <li class="wave-four" style="background-image: url(\'dist/images/other/wave4.png\');"></li>' +
            '   </ul>' +
            '  </div>' +
            '  <div class="cloud" style="background-image: url(\'dist/images/other/cloud-md.png\');"></div>' +
            '  <div class="cloud2" style="background-image: url(\'dist/images/other/cloud-md.png\');"></div>' +
            ' </div>',
        targetConfigs: {
            shakeTargetImg: true,
            diff: [
                targetDecorator('boat.png', true, 'boat'),
                targetDecorator('boat.png', true, 'boat'),
            ],
            position: [
                targetDecorator('boat.png', true, 'boat'),
                targetDecorator('boat.png', true, 'boat'),
                targetDecorator('boat.png', true, 'boat'),
            ],
        },
    },
];

