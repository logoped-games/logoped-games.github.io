// Configuration constants and settings
const SYLLABLES_AND_LETTERS_OPTIONS = [
    { label: 'С', letters: ['с'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'З', letters: ['з'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Ц', letters: ['ц'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Ш', letters: ['ш'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Ж', letters: ['ж'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Ч', letters: ['ч'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Щ', letters: ['щ'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Л', letters: ['л'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'Р', letters: ['р'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]},
    { label: 'В', letters: ['в'], targets: [
        {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
        {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
        {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
    ]}
];

export const config = {
    POSITION_BEGIN: 'begin',
    POSITION_MIDDLE: 'middle',
    POSITION_END: 'end',
    POSITION_UNKNOWN: 'unknown',
    MODE_SINGLE: 'single',
    MODE_GRID: 'grid',
    ANIMATION_MOVE_TO_TARGET_AND_ZOOM_OUT: 'move_to_target_and_zoom_out',
    ANIMATION_MOVE_TO_ITEM_AND_FIREWORK: 'move_to_item_and_firework',
    TYPE_DIFF: 'diff',
    TYPE_POSITION: 'position',
    TYPE_SYLLABLES: 'syllables',
    TYPE_LETTERS: 'letters',
    TYPE_ODD_ONE_OUT: 'odd_one_out',
    TYPE_ODD_ONE_OUT_SOUND: 'odd_one_out_sound',
    WORDS_DIR: 'images/words',
    ALLOWED_TYPES: [
        { type: 'diff', label: "Диференціація звуків" },
        { type: 'position', label: "Визначення місця звука в слові" },
        { type: 'syllables', label: "Збери слово" },
        { type: 'letters', label: "Збери слово по буквам" },
        { type: 'odd_one_out', label: "Четвертий зайвий" },
        { type: 'odd_one_out_sound', label: "Четвертий зайвий звук" }
    ],
    // Конфигурация кластеров родственных категорий для игры "Четвертий зайвий"
    // Каждый кластер - массив родственных категорий
    // При генерации выбирается категория из кластера, и четвертым словом будет слово,
    // которое НЕ имеет ни одного тега из этого кластера
    ODD_ONE_OUT_RELATED_CLUSTERS: [
        ['тварини', 'водні тварини', 'дикі тварини'],
        ['овочі', 'фрукти/ягоди', 'їжа', 'рослини']
    ],
    // Количество наборов для генерации на каждую основную категорию
    ODD_ONE_OUT_SETS_PER_CATEGORY: 20,
    ALLOWED_LETTERS: {
        diff: [
            { label: 'Л - Р', letters: ['л', 'р'], targets: [{value: 'л', label: 'Л'}, {value: 'р', label: 'Р'}] },
            { label: 'Л - В', letters: ['л', 'в'], targets: [{value: 'л', label: 'Л'}, {value: 'в', label: 'В'}] },
            { label: 'С - Ш', letters: ['с', 'ш'], targets: [{value: 'с', label: 'С'}, {value: 'ш', label: 'Ш'}] },
            { label: 'З - Ж', letters: ['з', 'ж'], targets: [{value: 'з', label: 'З'}, {value: 'ж', label: 'Ж'}] },
            { label: 'Ц - Ч', letters: ['ц', 'ч'], targets: [{value: 'ц', label: 'Ц'}, {value: 'ч', label: 'Ч'}] },
            { label: 'Ш - Щ', letters: ['ш', 'щ'], targets: [{value: 'ш', label: 'Ш'}, {value: 'щ', label: 'Щ'}] },
            { label: 'П - Б', letters: ['п', 'б'], targets: [{value: 'п', label: 'П'}, {value: 'б', label: 'Б'}] },
            { label: 'Х - Г', letters: ['х', 'г'], targets: [{value: 'х', label: 'Х'}, {value: 'г', label: 'Г'}] },
            { label: 'Т - Д', letters: ['т', 'д'], targets: [{value: 'т', label: 'Т'}, {value: 'д', label: 'Д'}] }
        ],
        position: [
            { label: 'С', letters: ['с'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'З', letters: ['з'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Ц', letters: ['ц'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Ш', letters: ['ш'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Ж', letters: ['ж'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Ч', letters: ['ч'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Щ', letters: ['щ'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Л', letters: ['л'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'Р', letters: ['р'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]},
            { label: 'В', letters: ['в'], targets: [
                {value: 'begin', label: '<img src="images/targets/begin.png" class="position-img">'},
                {value: 'middle', label: '<img src="images/targets/middle.png" class="position-img">'},
                {value: 'end', label: '<img src="images/targets/end.png" class="position-img">'}
            ]}
        ],
        syllables: SYLLABLES_AND_LETTERS_OPTIONS,
        letters: SYLLABLES_AND_LETTERS_OPTIONS,
        odd_one_out_sound: [
            { label: 'Л - Р', letters: ['л', 'р'], targets: [{value: 'л', label: 'Л'}, {value: 'р', label: 'Р'}] },
            { label: 'Л - В', letters: ['л', 'в'], targets: [{value: 'л', label: 'Л'}, {value: 'в', label: 'В'}] },
            { label: 'С - Ш', letters: ['с', 'ш'], targets: [{value: 'с', label: 'С'}, {value: 'ш', label: 'Ш'}] },
            { label: 'З - Ж', letters: ['з', 'ж'], targets: [{value: 'з', label: 'З'}, {value: 'ж', label: 'Ж'}] },
            { label: 'Ц - Ч', letters: ['ц', 'ч'], targets: [{value: 'ц', label: 'Ц'}, {value: 'ч', label: 'Ч'}] },
            { label: 'Ш - Щ', letters: ['ш', 'щ'], targets: [{value: 'ш', label: 'Ш'}, {value: 'щ', label: 'Щ'}] },
            { label: 'П - Б', letters: ['п', 'б'], targets: [{value: 'п', label: 'П'}, {value: 'б', label: 'Б'}] },
            { label: 'Х - Г', letters: ['х', 'г'], targets: [{value: 'х', label: 'Х'}, {value: 'г', label: 'Г'}] },
            { label: 'Т - Д', letters: ['т', 'д'], targets: [{value: 'т', label: 'Т'}, {value: 'д', label: 'Д'}] }
        ]
    }
};
