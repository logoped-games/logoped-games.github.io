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

const WORDS_DIR = 'dist/images/words';

const ALLOWED_TYPES = [
    {
        type: TYPE_DIFF,
        label: "Диференціація звуків"
    },
    {
        type: TYPE_POSITION,
        label: "Визначення місця звука в слові"
    },
];

const ALLOWED_LETTERS = {
    diff: _.map([
        ['л', 'р'],
        ['л', 'в'],
        ['с', 'ш'],
        ['з', 'ж'],
        ['ц', 'ч'],
        ['ш', 'щ'],
        ['п', 'б'],
        ['х', 'г'],
        ['т', 'д'],
    ], (diffData) => {
        return {
            label: _.upperCase(diffData[0]) + ' - ' + _.upperCase(diffData[1]),
            letters: diffData,
            targets: [
                {value: diffData[0], label: _.upperCase(diffData[0])},
                {value: diffData[1], label: _.upperCase(diffData[1])},
            ]
        };
    }),
    position: _.map(['с', 'з', 'ц', 'ш', 'ж', 'ч', 'щ', 'л', 'р', 'в'], (letter) => {
        return {
            label: _.upperCase(letter),
            letters: [letter],
            targets: [
                {value: POSITION_BEGIN, label: '<img src="dist/images/targets/begin.png" class="position-img">'},
                {value: POSITION_MIDDLE, label: '<img src="dist/images/targets/middle.png" class="position-img">'},
                {value: POSITION_END, label: '<img src="dist/images/targets/end.png" class="position-img">'},
            ]
        };
    }),
};