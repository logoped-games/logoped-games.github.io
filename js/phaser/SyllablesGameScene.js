/**
 * Сцена для игры "Збери по складам"
 */
import {BaseGameScene} from './BaseGameScene.js';
import {soundManager} from '../soundManager.js';

export class SyllablesGameScene extends BaseGameScene {
    constructor(key) {
        super(key);
        this.syllableTexts = []; // Массив текстов слогов внизу
        this.syllablePlaceholders = []; // Массив placeholder в середине
        this.currentSyllableIndex = 0; // Текущий индекс слога
        this.shuffledSyllables = []; // Перемешанные слоги
        this.currentWordUnits = []; // Текущие элементы (слоги или буквы)
    }

    isLettersGame() {
        return this.gameConfig?.gameType === 'letters';
    }

    getWordUnits(word) {
        if (!word) {
            return [];
        }

        if (this.isLettersGame()) {
            if (!word.word) {
                return [];
            }

            const rawChars = Array.from(word.word);
            const lettersOnly = rawChars.filter(char => /\p{L}/u.test(char));
            return lettersOnly;
        }

        return word.syllables || [];
    }

    getDisplayUnit(unit) {
        if (this.isLettersGame() && typeof unit === 'string') {
            return unit.toLocaleUpperCase('uk-UA');
        }
        return unit;
    }

    areOrdersEqual(first, second) {
        if (first.length !== second.length) {
            return false;
        }
        for (let i = 0; i < first.length; i++) {
            if (first[i] !== second[i]) {
                return false;
            }
        }
        return true;
    }

    shuffleUnits(originalUnits) {
        if (originalUnits.length <= 1) {
            return [...originalUnits];
        }

        const shuffled = [...originalUnits];

        const fisherYates = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };

        let attempts = 0;
        do {
            fisherYates(shuffled);
            attempts++;
            if (attempts > 20) {
                break;
            }
        } while (this.areOrdersEqual(shuffled, originalUnits));

        if (this.areOrdersEqual(shuffled, originalUnits)) {
            const fallback = [...originalUnits];
            for (let i = 0; i < fallback.length - 1; i++) {
                if (fallback[i] !== fallback[i + 1]) {
                    [fallback[i], fallback[i + 1]] = [fallback[i + 1], fallback[i]];
                    return fallback;
                }
            }
        }

        return shuffled;
    }

    /**
     * Предзагрузка ресурсов
     */
    preload() {
        if (!this.gameConfig) {
            return;
        }

        // Загружаем фон
        if (!this.textures.exists('background')) {
            this.load.image('background', this.gameConfig.background);
        }

        // Загружаем фон для картинки вопроса
        const backgrounds = this.gameConfig.wordConfig?.backgrounds || [];
        if (backgrounds.length > 0) {
            backgrounds.forEach((bg, index) => {
                const bgKey = `question-bg-${index}`;
                if (!this.textures.exists(bgKey)) {
                    this.load.image(bgKey, bg);
                }
            });
        }

        // Загружаем картинку вопроса
        const wordToLoad = this.currentWord || this.gameConfig.currentWord;
        if (wordToLoad && wordToLoad.img) {
            const wordImagePath = `images/words/${wordToLoad.img}`;

            if (this.textures.exists('question')) {
                this.textures.remove('question');
            }

            const timestamp = Date.now();
            const wordImagePathWithCache = `${wordImagePath}?t=${timestamp}`;
            this.load.image('question', wordImagePathWithCache);
        }

        // Загружаем звуки
        this.load.audio('success', 'sounds/success4.mp3');
        this.load.audio('fail', 'sounds/fail.mp3');

        if (!this.textures.exists('sound-toggle-on')) {
            this.load.image('sound-toggle-on', 'css/images/sound-on.png');
        }

        if (!this.textures.exists('sound-toggle-off')) {
            this.load.image('sound-toggle-off', 'css/images/sound-off.png');
        }
    }

    /**
     * Создание игровой сцены
     */
    create() {
        if (!this.gameConfig) {
            console.error('Missing game config');
            return;
        }

        const wordToUse = this.currentWord || this.gameConfig.currentWord;
        if (!wordToUse) {
            console.error('Missing current word');
            return;
        }

        // Проверяем наличие элементов (слогов или букв)
        const initialUnits = this.getWordUnits(wordToUse);
        if (!initialUnits || initialUnits.length === 0) {
            console.error('Word has no units to collect');
            return;
        }
        this.currentWordUnits = initialUnits;

        // Настраиваем фильтры текстур
        this.setupTextureFilters();

        const layoutConfig = this.gameConfig.layoutConfig;

        // Создаем фон
        this.createBackground();

        // Создаем заголовок
        this.createHeader();

        // Создаем кнопку возврата
        this.createHomeButton();
        this.createSoundToggleButton();
        this.applySoundMuteState(soundManager.isMuted);

        // Создаем картинку вопроса
        if (this.textures.exists('question')) {
            this.createQuestion(layoutConfig);
            this.createSyllablesGame();
        } else {
            this.load.once('filecomplete-image-question', () => {
                this.setupTextureFilters();
                this.createQuestion(layoutConfig);
                this.createSyllablesGame();
            });
        }
    }

    /**
     * Переопределяем createTargets чтобы ничего не делать для syllables игры
     */
    createTargets(layoutConfig) {
        // Для syllables игры не создаем targets, они создаются в createSyllablesGame
    }

    /**
     * Переопределяем restoreGameElements чтобы ничего не делать для syllables игры
     */
    restoreGameElements() {
        // Для syllables игры не восстанавливаем targets
    }

    /**
     * Создание заголовка игры с буквой
     */
    createHeader() {
        const centerX = this.scale.width / 2;
        const headerY = this.scale.height * 0.08;

        const baseTitle = this.isLettersGame() ? 'Збери слово по буквам' : 'Збери слово';
        let headerText = this.gameConfig.gameHeader || baseTitle;
        if (this.gameConfig.targetConfig && this.gameConfig.targetConfig.label) {
            headerText = `${baseTitle} - ${this.gameConfig.targetConfig.label}`;
        }

        // Адаптивный размер шрифта
        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 60, 16);
        const headerFontSize = Math.round(Math.max(baseFontSize * 1.5, 14));

        // Создаем текст
        const tempText = this.add.text(centerX, headerY, headerText, {
            fontFamily: 'Arial',
            fontSize: `${headerFontSize}px`,
            color: '#000000',
            fontWeight: 'bold',
            align: 'center',
            resolution: 4
        }).setOrigin(0.5);

        const textWidth = tempText.width;
        const textHeight = tempText.height;

        // Создаем белый фон
        const padding = 15;
        const cornerRadius = 20;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = textHeight + padding * 2;

        const headerBg = this.add.graphics();
        headerBg.fillStyle(0xffffff, 1);
        headerBg.fillRoundedRect(
            centerX - bgWidth / 2,
            headerY - bgHeight / 2,
            bgWidth,
            bgHeight,
            cornerRadius
        );
        headerBg.setDepth(0);

        tempText.setDepth(1);

        this.header = tempText;
        this.headerBg = headerBg;
    }

    /**
     * Создание элементов игры для слогов
     */
    createSyllablesGame() {
        const wordToUse = this.currentWord || this.gameConfig.currentWord;
        const currentUnits = this.getWordUnits(wordToUse);
        if (!currentUnits || currentUnits.length === 0) {
            console.error('Word has no units to collect');
            return;
        }

        this.currentWordUnits = currentUnits;
        this.shuffledSyllables = this.shuffleUnits(currentUnits);
        this.currentSyllableIndex = 0;

        // Создаем placeholder'ы для слогов в середине экрана
        this.createSyllablePlaceholders(currentUnits.length);

        // Создаем слоги внизу экрана
        this.createSyllableTexts();
    }

    /**
     * Создание пустых прямоугольников-плейсхолдеров для слогов
     */
    createSyllablePlaceholders(count) {
        this.syllablePlaceholders = [];
        const centerX = this.scale.width / 2;
        const placeholderY = this.scale.height * 0.65; // Опускаем ниже чтобы не пересекаться с картинкой

        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 20, 16);
        const syllableFontSize = Math.max(baseFontSize * 1.5, 32);

        // Размер placeholder для слога
        const widthMultiplier = this.isLettersGame() ? 1.4 : 2.5;
        const heightMultiplier = this.isLettersGame() ? 1.6 : 1.8;
        const spacingMultiplier = this.isLettersGame() ? 0.3 : 0.5;

        const placeholderWidth = syllableFontSize * widthMultiplier;
        const placeholderHeight = syllableFontSize * heightMultiplier;

        // Расстояние между placeholder'ами
        const spacing = placeholderWidth + syllableFontSize * spacingMultiplier;
        const totalWidth = (count - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        for (let i = 0; i < count; i++) {
            const placeholder = this.add.graphics();
            placeholder.fillStyle(0xffffff, 1); // Белый
            placeholder.lineStyle(3, 0x000000, 1); // Черная рамка
            placeholder.fillRoundedRect(
                -placeholderWidth / 2,
                -placeholderHeight / 2,
                placeholderWidth,
                placeholderHeight,
                10
            );
            placeholder.strokeRoundedRect(
                -placeholderWidth / 2,
                -placeholderHeight / 2,
                placeholderWidth,
                placeholderHeight,
                10
            );

            const placeholderX = startX + i * spacing;
            placeholder.setPosition(placeholderX, placeholderY);

            this.syllablePlaceholders.push({
                graphics: placeholder,
                x: placeholderX,
                y: placeholderY,
                width: placeholderWidth,
                height: placeholderHeight,
                syllableIndex: i
            });
        }
    }

    /**
     * Создание слогов внизу экрана
     */
    createSyllableTexts() {
        this.syllableTexts = [];
        const centerX = this.scale.width / 2;
        const syllableY = this.scale.height * 0.85; // Внизу экрана

        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 20, 16);
        const syllableFontSize = Math.max(baseFontSize * 1.5, 32);

        // Размер текстового блока для слога
        const widthMultiplier = this.isLettersGame() ? 1.4 : 2.5;
        const heightMultiplier = this.isLettersGame() ? 1.6 : 1.8;
        const spacingMultiplier = this.isLettersGame() ? 0.3 : 0.5;

        const textWidth = syllableFontSize * widthMultiplier;
        const textHeight = syllableFontSize * heightMultiplier;

        // Расстояние между слогами
        const spacing = textWidth + syllableFontSize * spacingMultiplier;
        const totalWidth = (this.shuffledSyllables.length - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        this.shuffledSyllables.forEach((syllable, index) => {
            // Белый фон с рамкой
            const bgGraphics = this.add.graphics();
            bgGraphics.fillStyle(0xffffff, 1);
            bgGraphics.lineStyle(2, 0x000000, 1);
            bgGraphics.fillRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);
            bgGraphics.strokeRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);

            // Текст слога
            const text = this.add.text(0, 0, this.getDisplayUnit(syllable), {
                fontFamily: 'Arial',
                fontSize: `${syllableFontSize}px`,
                color: '#000000',
                fontWeight: 'bold',
                resolution: 4
            }).setOrigin(0.5);

            // Контейнер для фона и текста
            const container = this.add.container(startX + index * spacing, syllableY);
            container.add([bgGraphics, text]);

            // Делаем интерактивным
            container.setSize(textWidth, textHeight);
            container.setInteractive({useHandCursor: true});

            // Обработчик клика
            container.on('pointerdown', () => {
                this.handleSyllableClick(container, syllable);
            });

            this.syllableTexts.push({
                container: container,
                graphics: bgGraphics,
                text: text,
                syllable: syllable,
                x: startX + index * spacing,
                y: syllableY
            });
        });
    }

    /**
     * Обработка клика по слогу
     */
    handleSyllableClick(syllableContainer, clickedSyllable) {
        if (this.isProcessingAnswer) {
            return;
        }

        const wordUnits = this.currentWordUnits;
        const correctSyllable = wordUnits[this.currentSyllableIndex];

        if (clickedSyllable === correctSyllable) {
            // Правильный ответ
            this.playSuccess();
            this.moveSyllableToPlaceholder(syllableContainer);
        } else {
            // Неправильный ответ
            this.playFail();
            this.shakeSyllable(syllableContainer);
        }
    }

    /**
     * Перемещение слога на место placeholder
     */
    moveSyllableToPlaceholder(syllableContainer) {
        this.isProcessingAnswer = true;

        const placeholder = this.syllablePlaceholders[this.currentSyllableIndex];

        // Запускаем анимацию перемещения
        this.tweens.add({
            targets: syllableContainer,
            x: placeholder.x,
            y: placeholder.y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Увеличиваем слог на месте placeholder
                this.tweens.add({
                    targets: syllableContainer,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    yoyo: true,
                    ease: 'Power2',
                    onComplete: () => {
                        // Делаем слог неактивным
                        syllableContainer.disableInteractive();

                        // Переходим к следующему слогу
                        this.currentSyllableIndex++;

                        if (this.currentSyllableIndex >= this.currentWordUnits.length) {
                            // Слово собрано полностью
                            this.onWordCompleted();
                        } else {
                            this.isProcessingAnswer = false;
                        }
                    }
                });
            }
        });
    }

    /**
     * Дрожание слога при неправильном ответе
     */
    shakeSyllable(syllableContainer) {
        const originalX = syllableContainer.x;
        const originalY = syllableContainer.y;

        this.tweens.add({
            targets: syllableContainer,
            x: originalX - 10,
            duration: 50,
            yoyo: true,
            repeat: 5,
            ease: 'Power1',
            onComplete: () => {
                this.isProcessingAnswer = false;
            }
        });
    }

    /**
     * Обработка завершения слова
     */
    onWordCompleted() {
        // Ждем 1 секунду, затем переходим к следующему слову
        this.time.delayedCall(1000, () => {
            if (this.callbacks && this.callbacks.onNextWord) {
                this.callbacks.onNextWord();
            }
        });
    }

    /**
     * Обновление слова
     */
    async updateWord(newWord) {
        // Сбрасываем флаг блокировки
        this.isProcessingAnswer = false;

        // Обновляем currentWord
        this.currentWord = newWord;

        // Очищаем старые элементы слогов
        this.syllableTexts.forEach(item => {
            if (item.container && item.container.active) {
                item.container.destroy();
            }
        });
        this.syllablePlaceholders.forEach(item => {
            if (item.graphics && item.graphics.active) {
                item.graphics.destroy();
            }
        });

        this.syllableTexts = [];
        this.syllablePlaceholders = [];
        this.currentSyllableIndex = 0; // Сбрасываем индекс
        this.currentWordUnits = [];

        // Устанавливаем флаг что нужно создать слоги после загрузки картинки
        this.pendingSyllableCreation = true;

        // Вызываем родительский метод для обновления картинки
        await super.updateWord(newWord);
    }

    /**
     * Переопределяем loadNewQuestionImage чтобы создавать слоги после загрузки картинки
     */
    loadNewQuestionImage(word, questionSize, layoutConfig) {
        const wordImagePath = `images/words/${word.img}`;
        const timestamp = Date.now();
        const wordImagePathWithCache = `${wordImagePath}?t=${timestamp}`;
        const centerX = this.scale.width / 2;
        const layoutConfigLocal = this.gameConfig.layoutConfig;
        const questionSizePercent = layoutConfig.question?.sizePercent;
        const questionSizeLocal = Math.min(
            this.scale.width * questionSizePercent,
            this.scale.height * questionSizePercent
        );

        const questionYPercent = layoutConfig.question?.yPercent;
        const questionY = this.scale.height * questionYPercent;

        // Вычисляем позицию картинки и белого фона с учетом topOffset
        const topOffset = layoutConfig.question?.topOffset;
        const questionImageY = topOffset !== undefined
            ? questionY + (this.scale.height * topOffset)
            : questionY;

        // Создаем или обновляем белый круглый фон
        const whiteBgRadius = questionSizeLocal * (layoutConfig.question?.maskRadiusPercent || 0.4);
        if (!this.questionWhiteBg || !this.questionWhiteBg.active) {
            this.questionWhiteBg = this.add.graphics();
            this.questionWhiteBg.fillStyle(0xffffff, 1);
            this.questionWhiteBg.fillCircle(centerX, questionImageY, whiteBgRadius);
            this.questionWhiteBg.setDepth(1);
        } else {
            this.questionWhiteBg.clear();
            this.questionWhiteBg.fillStyle(0xffffff, 1);
            this.questionWhiteBg.fillCircle(centerX, questionImageY, whiteBgRadius);
            this.questionWhiteBg.setAlpha(1);
        }

        // Удаляем старую текстуру если существует
        if (this.textures.exists('question')) {
            this.textures.remove('question');
        }

        // Загружаем новое изображение
        this.load.image('question', wordImagePathWithCache);

        // Ждем загрузки и создаем изображение
        this.load.once('filecomplete-image-question', () => {
            this.setupTextureFilters();

            if (this.textures.exists('question')) {
                const questionImg = this.textures.get('question');
                const questionAspectRatio = questionImg ? questionImg.source[0].width / questionImg.source[0].height : 1;

                const whiteBgRadiusInner = questionSizeLocal * (layoutConfig.question?.maskRadiusPercent || 0.4);
                const paddingPercent = layoutConfig.question?.paddingPercent || 0.15;
                const imageRadius = whiteBgRadiusInner * (1 - paddingPercent);

                this.whiteBgRadius = whiteBgRadiusInner;
                this.imageRadius = imageRadius;

                const maxDiameter = imageRadius * 2;
                const diagonalFactor = Math.sqrt(1 + 1 / (questionAspectRatio * questionAspectRatio));
                const maxSize = maxDiameter / diagonalFactor * 0.90;

                let questionWidth, questionHeight;
                if (questionAspectRatio >= 1) {
                    questionWidth = maxSize;
                    questionHeight = questionWidth / questionAspectRatio;
                } else {
                    questionHeight = maxSize;
                    questionWidth = questionHeight * questionAspectRatio;
                }

                const diagonal = Math.sqrt(questionWidth * questionWidth + questionHeight * questionHeight);
                if (diagonal > maxDiameter * 0.90) {
                    const scale = (maxDiameter * 0.90) / diagonal;
                    questionWidth *= scale;
                    questionHeight *= scale;
                }

                // Создаем маску
                if (this.questionMask) {
                    this.questionMask.destroy();
                    this.questionMask = null;
                }

                const maskGraphics = this.make.graphics();
                maskGraphics.fillStyle(0xffffff);
                maskGraphics.fillCircle(centerX, questionImageY, imageRadius);
                this.questionMask = maskGraphics;
                const mask = this.questionMask.createGeometryMask();

                // Создаем новое изображение
                this.question = this.add.image(centerX, questionImageY, 'question')
                    .setOrigin(0.5)
                    .setDisplaySize(questionWidth, questionHeight)
                    .setMask(mask)
                    .setAlpha(0)
                    .setDepth(2);

                // Плавное появление
                this.tweens.add({
                    targets: this.question,
                    alpha: 1,
                    duration: 300,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        this.isProcessingAnswer = false;
                    }
                });
            }

            // После отрисовки картинки создаем слоги
            if (this.pendingSyllableCreation) {
                this.pendingSyllableCreation = false;
                this.createSyllablesGame();
            }
        });

        // Запускаем загрузку
        this.load.start();
    }

    /**
     * Воспроизведение звука успеха
     */
    playSuccess() {
        if (soundManager.isMuted) {
            return;
        }

        if (!this.sound) {
            return;
        }

        const sound = this.sound.add('success', {volume: 0.5});
        sound.play();
    }

    /**
     * Воспроизведение звука ошибки
     */
    playFail() {
        if (soundManager.isMuted) {
            return;
        }

        if (!this.sound) {
            return;
        }

        const sound = this.sound.add('fail', {volume: 0.5});
        sound.play();
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        super.destroy();
        this.syllableTexts = [];
        this.syllablePlaceholders = [];
        this.currentWordUnits = [];
    }
}

