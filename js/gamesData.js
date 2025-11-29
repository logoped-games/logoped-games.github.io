// Constants
const POSITION_BEGIN = 'begin';
const POSITION_MIDDLE = 'middle';
const POSITION_END = 'end';
const POSITION_UNKNOWN = 'unknown';

const MODE_SINGLE = 'single';
const MODE_GRID = 'grid';

const ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT = 'move_to_target_and_zoom_out';
const ANIMATION_MOVE_TO_ITEM_AND_FIREWORK = 'move_to_item_and_firework';

const TYPE_DIFF = 'diff';
const TYPE_POSITION = 'position';
const TYPE_SYLLABLES = 'syllables';

const BASE_TARGET_DIR = 'images/targets';

function targetDecorator(img, appendDir = true, cssClass = null) {
    return {
        img: (appendDir ? (BASE_TARGET_DIR + "/") : '') + img,
        cssClass: cssClass,
    };
}

const BASE_LAYOUT_CONFIG = {
    question: {
        yPercent: 0.36,
        sizePercent: 0.6,
        maskRadiusPercent: 0.3,
        paddingPercent: 0.02
    },
    targets: {
        yPercent: 0.7,
        sizePercent: 0.2
    }
};

window.GAMES = [
    {
        thumbnails: {
            diff: "images/thumbnails/diff/roblox-1.jpg",
            position: "images/thumbnails/position/roblox-1.jpg",
            syllables: "images/thumbnails/syllables/roblox-1.jpg",
            letters: "images/thumbnails/letters/roblox-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/roblox-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/roblox-1.jpg",
        },
        background: "images/backgrounds/roblox.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/roblox-coin.png"],
        },
        gameName: "roblox-1",
        targetConfigs: {
            diff: [
                targetDecorator('roblox-1.png'),
                targetDecorator('roblox-2.png'),
            ],
            position: [
                targetDecorator('roblox-1.png'),
                targetDecorator('roblox-2.png'),
                targetDecorator('roblox-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                // yPercent: 0.32,
                sizePercent: 0.43,
                maskRadiusPercent: 0.38,
                topOffset: 0
            },
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/spongebob-1.jpg",
            position: "images/thumbnails/position/spongebob-1.jpg",
            syllables: "images/thumbnails/syllables/spongebob-1.jpg",
            letters: "images/thumbnails/letters/spongebob-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/spongebob-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/spongebob-1.jpg",
        },
        background: "images/backgrounds/spongebob.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/burger.png"],
        },
        gameName: "spongebob-1",
        targetConfigs: {
            diff: [
                targetDecorator('spongebob-1.png'),
                targetDecorator('spongebob-2.png'),
            ],
            position: [
                targetDecorator('spongebob-1.png'),
                targetDecorator('spongebob-3.png'),
                targetDecorator('spongebob-2.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                yPercent: 0.32,
                sizePercent: 0.46,
                maskRadiusPercent: 0.38,
                topOffset: 0
            },
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/kozak-1.jpg",
            position: "images/thumbnails/position/kozak-1.jpg",
            syllables: "images/thumbnails/syllables/kozak-1.jpg",
            letters: "images/thumbnails/letters/kozak-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/kozak-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/kozak-1.jpg",
        },
        background: "images/backgrounds/kozak.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/footbal-ball.png"],
        },
        gameName: "kozak-1",
        targetConfigs: {
            diff: [
                targetDecorator('kozak-1.png'),
                targetDecorator('kozak-2.png'),
            ],
            position: [
                targetDecorator('kozak-1.png'),
                targetDecorator('kozak-2.png'),
                targetDecorator('kozak-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                // yPercent: 0.35,
                sizePercent: 0.43,
                maskRadiusPercent: 0.4,
                topOffset: 0
            },
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/princess-1.jpg",
            position: "images/thumbnails/position/princess-1.jpg",
            syllables: "images/thumbnails/syllables/princess-1.jpg",
            letters: "images/thumbnails/letters/princess-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/princess-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/princess-1.jpg",
        },
        background: "images/backgrounds/princess.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/diadem.png"],
        },
        gameName: "princess-1",
        targetConfigs: {
            diff: [
                targetDecorator('princess-1.png'),
                targetDecorator('princess-2.png'),
            ],
            position: [
                targetDecorator('princess-1.png'),
                targetDecorator('princess-2.png'),
                targetDecorator('princess-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                yPercent: 0.35,
                sizePercent: 0.43,
                maskRadiusPercent: 0.3,
                topOffset: 0.05
            },
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/minion-1.jpg",
            position: "images/thumbnails/position/minion-1.jpg",
            syllables: "images/thumbnails/syllables/minion-1.jpg",
            letters: "images/thumbnails/letters/minion-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/minion-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/minion-1.jpg",
        },
        background: "images/backgrounds/minion.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/banana.png"],
        },
        gameName: "minion-1",
        targetConfigs: {
            diff: [
                targetDecorator('minion-1.png'),
                targetDecorator('minion-3.png'),
            ],
            position: [
                targetDecorator('minion-1.png'),
                targetDecorator('minion-2.png'),
                targetDecorator('minion-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.5,
                maskRadiusPercent: 0.25,
                topOffset: -0.01
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/stich-1.jpg",
            position: "images/thumbnails/position/stich-1.jpg",
            syllables: "images/thumbnails/syllables/stich-1.jpg",
            letters: "images/thumbnails/letters/stich-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/stich-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/stich-1.jpg",
        },
        background: "images/backgrounds/stich.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/pineapple.png"],
        },
        gameName: "stich-1",
        targetConfigs: {
            diff: [
                targetDecorator('stich-1.png'),
                targetDecorator('stich-2.png'),
            ],
            position: [
                targetDecorator('stich-1.png'),
                targetDecorator('stich-2.png'),
                targetDecorator('stich-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                yPercent: 0.35,
                sizePercent: 0.45,
                maskRadiusPercent: 0.37,
                topOffset: 0
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/football-1.jpg",
            position: "images/thumbnails/position/football-1.jpg",
            syllables: "images/thumbnails/syllables/football-1.jpg",
            letters: "images/thumbnails/letters/football-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/football-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/football-1.jpg",
        },
        background: "images/backgrounds/football-arena.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/footbal-ball.png"],
        },
        gameName: "football-1",
        targetConfigs: {
            diff: [
                targetDecorator('goalkeeper-1.png'),
                targetDecorator('goalkeeper-2.png'),
            ],
            position: [
                targetDecorator('goalkeeper-1.png'),
                targetDecorator('goalkeeper-2.png'),
                targetDecorator('goalkeeper-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                // yPercent: 0.35,
                sizePercent: 0.43,
                maskRadiusPercent: 0.4,
                topOffset: 0
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/arctic-1.jpg",
            position: "images/thumbnails/position/arctic-1.jpg",
            syllables: "images/thumbnails/syllables/arctic-1.jpg",
            letters: "images/thumbnails/letters/arctic-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/arctic-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/arctic-1.jpg",
        },
        background: "images/backgrounds/arctic.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/fish-bicket.png"],
        },
        gameName: "arctic-1",
        targetConfigs: {
            diff: [
                targetDecorator('penguin-1.png'),
                targetDecorator('penguin-2.png'),
            ],
            position: [
                targetDecorator('penguin-1.png'),
                targetDecorator('penguin-3.png'),
                targetDecorator('penguin-2.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                // yPercent: 0.35,
                sizePercent: 0.43,
                maskRadiusPercent: 0.33,
                topOffset: 0.02
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/castle-1.jpg",
            position: "images/thumbnails/position/castle-1.jpg",
            syllables: "images/thumbnails/syllables/castle-1.jpg",
            letters: "images/thumbnails/letters/castle-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/castle-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/castle-1.jpg",
        },
        background: "images/backgrounds/castle.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/chest.png"],
        },
        gameName: "castle-1",
        targetConfigs: {
            diff: [
                targetDecorator('dragon-2.png'),
                targetDecorator('dragon-1.png'),
            ],
            position: [
                targetDecorator('dragon-2.png'),
                targetDecorator('dragon-1.png'),
                targetDecorator('dragon-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                yPercent: 0.35,
                sizePercent: 0.45,
                maskRadiusPercent: 0.27,
                topOffset: 0.05
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/fishing-1.jpg",
            position: "images/thumbnails/position/fishing-1.jpg",
            syllables: "images/thumbnails/syllables/fishing-1.jpg",
            letters: "images/thumbnails/letters/fishing-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/fishing-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/fishing-1.jpg",
        },
        background: "images/backgrounds/fishing.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/fish.png"],
        },
        gameName: "fishing-1",
        targetConfigs: {
            diff: [
                targetDecorator('cat-1.png'),
                targetDecorator('cat-2.png'),
            ],
            position: [
                targetDecorator('cat-1.png'),
                targetDecorator('cat-2.png'),
                targetDecorator('cat-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.5,
                maskRadiusPercent: 0.3,
                topOffset: 0.0
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/magic-1.jpg",
            position: "images/thumbnails/position/magic-1.jpg",
            syllables: "images/thumbnails/syllables/magic-1.jpg",
            letters: "images/thumbnails/letters/magic-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/magic-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/magic-1.jpg",
        },
        background: "images/backgrounds/magic-1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/magic-zorb.png"],
        },
        gameName: "magic-1",
        targetConfigs: {
            diff: [
                targetDecorator('harry.png'),
                targetDecorator('hermione.png'),
            ],
            position: [
                targetDecorator('harry.png'),
                targetDecorator('ron.png'),
                targetDecorator('hermione.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.4,
                maskRadiusPercent: 0.38,
                topOffset: 0.0
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/cake-1.jpg",
            position: "images/thumbnails/position/cake-1.jpg",
            syllables: "images/thumbnails/syllables/cake-1.jpg",
            letters: "images/thumbnails/letters/cake-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/cake-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/cake-1.jpg",
        },
        background: "images/backgrounds/cake-1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/cake.png"],
        },
        gameName: "cake-1",
        targetConfigs: {
            diff: [
                targetDecorator('child-2.png'),
                targetDecorator('child-3.png'),
            ],
            position: [
                targetDecorator('child-2.png'),
                targetDecorator('child-3.png'),
                targetDecorator('child-1.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.52,
                maskRadiusPercent: 0.28,
                topOffset: 0.02
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/space-1.jpg",
            position: "images/thumbnails/position/space-1.jpg",
            syllables: "images/thumbnails/syllables/space-1.jpg",
            letters: "images/thumbnails/letters/space-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/space-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/space-1.jpg",
        },
        background: "images/backgrounds/space-1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/ufo.png"],
        },
        gameName: "space-1",
        targetConfigs: {
            diff: [
                targetDecorator('planet-1.png'),
                targetDecorator('planet-2.png'),
            ],
            position: [
                targetDecorator('planet-1.png'),
                targetDecorator('planet-2.png'),
                targetDecorator('planet-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.6,
                maskRadiusPercent: 0.2,
                topOffset: -0.055
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/sea-2.jpg",
            position: "images/thumbnails/position/sea-2.jpg",
            syllables: "images/thumbnails/syllables/sea-2.jpg",
            letters: "images/thumbnails/letters/sea-2.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/sea-2.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/sea-2.jpg",
        },
        background: "images/backgrounds/sea-2.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/sea_shell.png"],
        },
        gameName: "sea-2",
        targetConfigs: {
            diff: [
                targetDecorator('crab.png'),
                targetDecorator('crab.png'),
            ],
            position: [
                targetDecorator('crab.png'),
                targetDecorator('crab.png'),
                targetDecorator('crab.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.5,
                maskRadiusPercent: 0.3,
                topOffset: 0.01
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/jungle-1.jpg",
            position: "images/thumbnails/position/jungle-1.jpg",
            syllables: "images/thumbnails/syllables/jungle-1.jpg",
            letters: "images/thumbnails/letters/jungle-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/jungle-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/jungle-1.jpg",
        },
        background: "images/backgrounds/jungle-1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/banana.png"],
        },
        gameName: "jungle-1",
        targetConfigs: {
            diff: [
                targetDecorator('monkey-1.png'),
                targetDecorator('monkey-3.png'),
            ],
            position: [
                targetDecorator('monkey-1.png'),
                targetDecorator('monkey-2.png'),
                targetDecorator('monkey-3.png'),
            ],
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                sizePercent: 0.5,
                maskRadiusPercent: 0.25,
                topOffset: -0.01
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/forest-1.jpg",
            position: "images/thumbnails/position/forest-1.jpg",
            syllables: "images/thumbnails/syllables/forest-1.jpg",
            letters: "images/thumbnails/letters/forest-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/forest-1.jpg", // Используем существующую миниатюру
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/forest-1.jpg", // Используем существующую миниатюру
        },
        background: "images/backgrounds/forest1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/raspberry.png"],
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
            syllables: [],
            letters: [],
            odd_one_out: [], // Не используется в новой игре
            odd_one_out_sound: [], // Не используется в новой игре
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                maskRadiusPercent: 0.25,
                topOffset: 0.05
            }
        }),
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/winter-1.jpg",
            position: "images/thumbnails/position/winter-1.jpg",
            syllables: "images/thumbnails/syllables/winter-1.jpg",
            letters: "images/thumbnails/letters/winter-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/winter-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/winter-1.jpg",
        },
        background: "images/backgrounds/winter1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        gameName: "winter-1",
        wordConfig: {
            backgrounds: ["images/item-backgrounds/snowball.png"],
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
            ],
            syllables: [],
            letters: [],
            odd_one_out: [],
            odd_one_out_sound: [],
        },
        layoutConfig: BASE_LAYOUT_CONFIG,
    },
    {
        thumbnails: {
            diff: "images/thumbnails/diff/rocket-1.jpg",
            position: "images/thumbnails/position/rocket-1.jpg",
            syllables: "images/thumbnails/syllables/rocket-1.jpg",
            letters: "images/thumbnails/letters/rocket-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/rocket-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/rocket-1.jpg",
        },
        background: "images/backgrounds/night-town-2.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_ITEM_AND_FIREWORK,
        gameName: "rocket-1",
        wordConfig: {
            backgrounds: ["images/item-backgrounds/square.png"],
        },
        layoutConfig: {
            question: {
                yPercent: 0.35,
                sizePercent: 0.5,
                maskRadiusPercent: 0.25,
                paddingPercent: 0.02
            },
            targets: {
                yPercent: 0.65,
                sizePercent: 0.2
            }
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
            ],
            syllables: [],
            letters: [],
            odd_one_out: [],
            odd_one_out_sound: [],
        },
    },

    {
        thumbnails: {
            diff: "images/thumbnails/diff/winter-christmas-tree-1.jpg",
            position: "images/thumbnails/position/winter-christmas-tree-1.jpg",
            syllables: "images/thumbnails/syllables/winter-christmas-tree-1.jpg",
            letters: "images/thumbnails/letters/winter-christmas-tree-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/winter-christmas-tree-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/winter-christmas-tree-1.jpg",
        },
        background: "images/backgrounds/winter-4.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: [
                "images/item-backgrounds/christmas-ball-green.png",
                "images/item-backgrounds/christmas-ball-red.png",
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
            syllables: [],
            letters: [],
            odd_one_out: [],
            odd_one_out_sound: [],
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                yPercent: 0.30,
                sizePercent: 0.45,
                maskRadiusPercent: 0.3,
                topOffset: 0.02
            },
            // targets: {
            //     yPercent: 0.6,
            //     sizePercent: 0.3
            // }
        }),
    },

    {
        thumbnails: {
            diff: "images/thumbnails/diff/sea-boat-1.jpg",
            position: "images/thumbnails/position/sea-boat-1.jpg",
            syllables: "images/thumbnails/syllables/sea-boat-1.jpg",
            letters: "images/thumbnails/letters/sea-boat-1.jpg",
            odd_one_out: "images/thumbnails/odd_one_out/sea-boat-1.jpg",
            odd_one_out_sound: "images/thumbnails/odd_one_out_sound/sea-boat-1.jpg",
        },
        background: "images/backgrounds/sea-1.jpg",
        mode: MODE_SINGLE,
        animationType: ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT,
        wordConfig: {
            backgrounds: ["images/item-backgrounds/lifebuoy.png"],
        },
        gameName: "sea-boat-1",
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
            syllables: [],
            letters: [],
            odd_one_out: [],
            odd_one_out_sound: [],
        },
        layoutConfig: _.merge({}, BASE_LAYOUT_CONFIG, {
            question: {
                maskRadiusPercent: 0.2,
                topOffset: -0.02
            }
        }),
    },
];

