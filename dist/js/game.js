let CURRENT_STATE = {};

let SOUNDS = {};

$(function () {
    window.$gameTypeSelectContainer = $('.game-type-select-container');
    window.$gameLettersSelectContainer = $('.game-letters-select-container');
    window.$gameSelectContainer = $('.game-select-container');
    window.$gameContainer = $('.game-container');
    window.$menuContainer = $('.menu-container');
    window.$customBlock = $('.custom-block');

    resetState();
    renderGameTypeSelect();
    addHandlers();
    checkMainLink();

    SOUNDS.success = new Audio('./sounds/success.mp3');
    SOUNDS.fail = new Audio('./sounds/fail.mp3');

    SOUNDS.fireworksStart = new Audio('./sounds/fireworks-start.mp3');
    SOUNDS.fireworksExplode = new Audio('./sounds/fireworks-explode.mp3');
});

function renderGameTypeSelect() {
    $gameTypeSelectContainer.html('');

    ALLOWED_TYPES.forEach((type, index) => {
        $gameTypeSelectContainer.append('<div class="button game-type" data-type="' + type.type + '">' +
            '<span>' + type.label + '</span>' +
            '</div>');
    });
}

function renderGameLetterSelect() {
    $gameLettersSelectContainer.html('');

    ALLOWED_LETTERS[CURRENT_STATE.type].forEach((item, index) => {
        $gameLettersSelectContainer.append('<div class="button game-letters" data-targets-index="' + index + '">' +
            '<span>' + item.label + '</span>' +
            '</div>');
    });
}

function renderGameList() {
    $gameSelectContainer.html('');

    GAMES.forEach((gameData, index) => {
        if (gameData.allowedTypes && _.indexOf(gameData.allowedTypes, CURRENT_STATE.type) === -1) {
            return;
        }

        const thumbnail = gameData.thumbnails[CURRENT_STATE.type];

        $gameSelectContainer.append('<div class="game" data-index="' + index + '">' +
            '<img src="' + thumbnail + '" class="game-preview">' +
            '</div>');
    });
}

function renderTargets() {
    const gameData = GAMES[CURRENT_STATE.currentGameIndex];

    let counter = 0;

    const $targetsContainer = $gameContainer.find('.targets-container');

    $targetsContainer.html('');

    if (gameData.targetConfigs.targetBackground) {
        $targetsContainer.append('<img src="' + gameData.targetConfigs.targetBackground + '" class="target-background">');
    }

    let targets = _.map(gameData.targetConfigs[CURRENT_STATE.type], (targetConfig) => {
        targetConfig.value = CURRENT_STATE.targetConfig.targets[counter].value;
        targetConfig.label = CURRENT_STATE.targetConfig.targets[counter].label;
        counter++;
        return targetConfig;
    });

    let targetsHtml = '';

    targets.forEach((targetData) => {
        const targetValue = targetData.value;

        targetsHtml += '<div class="target ' + (targetData.cssClass || '') + '" data-target-value="' + targetValue + '">' +
            '<img src="' + targetData.img + '" class="target-img">' +
            '<span class="target-label">' + (targetData.label || '') + '</span>' +
            '</div>';
    });

    $targetsContainer.append('<div class="targets-buttons-container">' + targetsHtml + '</div>');
}

function onSelectGame(e) {
    CURRENT_STATE.allowedWords = [];
    CURRENT_STATE.isProgress = true;

    $gameSelectContainer.hide();
    $('.game-finished').hide();

    const $this = $(this);
    CURRENT_STATE.currentGameIndex = $this.data('index');
    const gameData = GAMES[CURRENT_STATE.currentGameIndex];

    const $backgroundContainer = $gameContainer.find('.game-background-container');

    $gameContainer.find('img').remove();
    $gameContainer.attr('data-game-name', gameData.gameName);
    $gameContainer.attr('data-game-type', CURRENT_STATE.type);

    $backgroundContainer.append('<img src="' + gameData.background + '" class="game-background">');

    renderTargets();

    const $itemContainer = $gameContainer.find('.item-container');

    $itemContainer.html('');
    $customBlock.html('');

    if (gameData.customBlock) {
        $customBlock.html(gameData.customBlock);
    }

    $gameContainer.find('.header h1').text(getGameHeader());
    $gameContainer.show();

    CURRENT_STATE.allowedWords = getAllowedWords();

    renderNextWord();
    checkMainLink();
}

function onSelectGameType(e) {
    CURRENT_STATE.type = $(this).data('type');
    $menuContainer.hide();

    renderGameLetterSelect();

    $gameLettersSelectContainer.show();
    checkMainLink();
}

function onSelectGameLetters(e) {
    CURRENT_STATE.targetConfig = ALLOWED_LETTERS[CURRENT_STATE.type][$(this).data('targets-index')];
    $menuContainer.hide();

    renderGameList();

    $gameSelectContainer.show();
    checkMainLink();
}

function onTargetClick(e) {
    if (!CURRENT_STATE.isProgress) {
        return;
    }

    const $target = $(this);
    const $itemContainer = $('.item-container');
    const $item = $itemContainer.find('.item');

    const targetValue = $target.data('target-value');
    const itemValue = $item.data('value');

    const gameData = GAMES[CURRENT_STATE.currentGameIndex];

    const animation = itemAnimations[gameData.animationType];

    if (targetValue === itemValue) {
        animation.onSuccess($item, $target);
    } else {
        animation.onFail($item, $target);
    }
}

function getAllowedWords() {
    let result = [];

    WORDS.forEach((word) => {
        const intersect = _.intersection(
            CURRENT_STATE.targetConfig.letters,
            _.map(word.letters, 'letter')
        );

        if (intersect.length !== 1) {
            return;
        }

        const position = _.find(word.letters, ['letter', intersect[0]]).position;

        if (CURRENT_STATE.type === TYPE_POSITION && position === POSITION_UNKNOWN) {
            return;
        }

        result.push({
            letter: intersect[0],
            word: word.word,
            img: word.img,
            position: position,
        });
    });

    return _.shuffle(result);
}

function renderNextWord() {
    const gameData = GAMES[CURRENT_STATE.currentGameIndex];
    const $itemContainer = $gameContainer.find('.item-container');

    $itemContainer.html('');

    $itemContainer.css('visibility', 'hidden');

    let currentWord = CURRENT_STATE.allowedWords.shift();

    if (!currentWord) {
        $('.game-finished').fadeIn(500);
        CURRENT_STATE.isProgress = false;
        return;
    }

    const imgPath = WORDS_DIR + '/' + currentWord.img;

    const itemValue = CURRENT_STATE.type === TYPE_DIFF
        ? currentWord.letter
        : currentWord.position;

    const background = gameData.wordConfig.backgrounds
        ? _.shuffle(gameData.wordConfig.backgrounds)[0]
        : null;

    $itemContainer.append('<div class="item" data-value="' + itemValue + '">' +
        (background ? '<img class="item-background" src="' + background + '">' : '') +
        '<div class="item-img-container"><img class="item-img" src="' + imgPath + '" style="" title="' + currentWord.word + '" alt="' + currentWord.word + '"></div>' +
        '</div>'
    );

    setTimeout(() => {
        $itemContainer.css('visibility', 'visible');
    }, 300);
}

function onMainClick() {
    resetState();
    $gameContainer.hide();

    $menuContainer.hide();
    renderGameTypeSelect();

    $gameTypeSelectContainer.show();
    checkMainLink();
}

function addHandlers() {
    $(document).on('click', '.game-type', onSelectGameType);
    $(document).on('click', '.game-letters', onSelectGameLetters);
    $(document).on('click', '.game', onSelectGame);

    $(document).on('click', '.target', onTargetClick);
    $(document).on('click', '.main-link', onMainClick);
}

function checkMainLink() {
    $('.nav').toggle(!$gameTypeSelectContainer.is(':visible'));
}

function getGameHeader() {
    return (CURRENT_STATE.type === TYPE_DIFF ? 'Диференціація ' : 'Визначення місця звука ')
        + CURRENT_STATE.targetConfig.label;
}

function resetState() {
    CURRENT_STATE = {
        type: null,
        mode: null,
        targetConfig: null,
        game: null,
        currentGameIndex: null,
        isProgress: false,
        allowedWords: []
    };
}

function playSound(name) {
    if (SOUNDS[name]) {
        SOUNDS[name].currentTime = 0;
        SOUNDS[name].play();
    }
}

function stopSound(name) {
    if (SOUNDS[name]) {
        SOUNDS[name].pause();
        SOUNDS[name].currentTime = 0;
    }
}