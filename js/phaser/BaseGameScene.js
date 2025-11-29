import {soundManager} from '../soundManager.js';

/**
 * Базовый класс для Phaser игр с переиспользуемой логикой
 */
export class BaseGameScene extends Phaser.Scene {
    constructor(key, config = {}) {
        super({key: key, ...config});
        this.gameConfig = null; // Конфиг игры из gamesData
        this.currentWord = null; // Текущее слово
        this.targets = []; // Массив целей
        this.targetLabels = []; // Метки для целей
        this.question = null; // Картинка вопроса
        this.questionBg = null; // Фон картинки вопроса
        this.questionWhiteBg = null; // Белый круглый фон для картинки
        this.background = null; // Фон игры
        this.callbacks = null; // Колбэки для взаимодействия с Vue
        this.questionMask = null; // Маска для картинки вопроса
        this.whiteBgRadius = null; // Радиус белого фона для использования в анимациях
        this.imageRadius = null; // Радиус изображения внутри маски
        this.header = null; // Заголовок игры
        this.headerBg = null; // Фон заголовка
        this.isProcessingAnswer = false; // Флаг блокировки кликов во время обработки ответа
        this.soundToggleButton = null; // Кнопка отключения звука
        this.soundToggleImage = null; // Иконка состояния звука
        this.soundToggleIconSize = null; // Размер отображаемой иконки
        this.questionLabel = null; // Текст при наведении на картинку слова
        this.questionHoverTarget = null;
        this.questionHoverHandlers = null;
    }

    /**
     * Инициализация игры
     */
    init(data) {
        this.gameConfig = data.gameConfig;
        this.currentWord = data.currentWord;
        this.callbacks = data.callbacks || {};

        // Проверяем наличие обязательных данных
        if (!this.gameConfig) {
            console.error('Game config is required');
            this.scene.stop();
            return;
        }

        // Обновляем currentWord в gameConfig для доступа в preload
        if (this.currentWord) {
            this.gameConfig.currentWord = this.currentWord;
        }
    }

    /**
     * Предзагрузка ресурсов
     */
    preload() {
        if (!this.gameConfig) {
            return;
        }

        // Загружаем фон (только если еще не загружен)
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
        // Используем currentWord из init или из gameConfig
        const wordToLoad = this.currentWord || this.gameConfig.currentWord;
        if (wordToLoad && wordToLoad.img) {
            const wordImagePath = `images/words/${wordToLoad.img}`;

            // Всегда удаляем старую текстуру, чтобы загрузить новую
            if (this.textures.exists('question')) {
                this.textures.remove('question');
            }

            // Добавляем timestamp к URL для принудительной перезагрузки
            const timestamp = Date.now();
            const wordImagePathWithCache = `${wordImagePath}?t=${timestamp}`;

            this.load.image('question', wordImagePathWithCache);
        }

        if (!this.textures.exists('sound-toggle-on')) {
            this.load.image('sound-toggle-on', 'css/images/sound-on.png');
        }

        if (!this.textures.exists('sound-toggle-off')) {
            this.load.image('sound-toggle-off', 'css/images/sound-off.png');
        }

        // Загружаем цели
        const targetConfigs = this.gameConfig.targetConfigs[this.gameConfig.gameType] || [];
        targetConfigs.forEach((targetConfig, index) => {
            const targetKey = `target-${index}`;
            this.load.image(targetKey, targetConfig.img);
        });

        // Загружаем изображения для меток (если это HTML с <img>)
        // currentTargets передаются через init, так что они доступны здесь
        const currentTargets = this.gameConfig?.currentTargets || [];
        currentTargets.forEach((targetData, index) => {
            const labelText = targetData?.label || '';
            // Извлекаем src из HTML img тега
            const imgMatch = labelText.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch && imgMatch[1]) {
                const labelImagePath = imgMatch[1];
                const labelImageKey = `target-label-${index}`;
                this.load.image(labelImageKey, labelImagePath);
            }
        });

        // Загружаем звуки
        this.load.audio('success', 'sounds/success4.mp3');
        this.load.audio('fail', 'sounds/fail.mp3');
        this.load.audio('fireworksStart', 'sounds/fireworks-start.mp3');
        this.load.audio('fireworksExplode', 'sounds/fireworks-explode.mp3');
    }

    /**
     * Создание игровой сцены
     */
    create() {
        if (!this.gameConfig) {
            console.error('Missing game config');
            return;
        }

        // Используем currentWord из init или из gameConfig
        const wordToUse = this.currentWord || this.gameConfig.currentWord;
        if (!wordToUse) {
            console.error('Missing current word');
            return;
        }

        // Настраиваем фильтры для всех загруженных текстур
        this.setupTextureFilters();

        // Изображения для меток должны быть загружены в preload

        // Получаем конфиг позиционирования (проценты экрана)
        const layoutConfig = this.gameConfig.layoutConfig;

        // Создаем фон
        this.createBackground();

        // Создаем заголовок игры
        this.createHeader();

        // Создаем кнопку возврата на главную
        this.createHomeButton();
        this.createSoundToggleButton();
        this.applySoundMuteState(soundManager.isMuted);

        // Ждем загрузки текстуры вопроса перед созданием
        if (this.textures.exists('question')) {
            this.createQuestion(layoutConfig);
        } else {
            // Если текстура еще не загружена, ждем события загрузки
            this.load.once('filecomplete-image-question', () => {
                this.setupTextureFilters(); // Настраиваем фильтры после загрузки
                this.createQuestion(layoutConfig);
            });
        }

        // Создаем цели
        this.createTargets(layoutConfig);

        // Создаем частицы для салютов если нужно
        if (this.gameConfig.animationType === 'move_to_item_and_firework') {
            this.createFireworkParticles();
        }
    }

    /**
     * Настройка фильтров текстур для сглаживания
     * Настройки фильтров уже применены в конфигурации рендерера,
     * этот метод используется как placeholder для будущих настроек при необходимости
     */
    setupTextureFilters() {
        // Настройки фильтров текстур уже установлены в PhaserGameManager.js
        // через render.minFilter, render.magFilter в конфигурации игры
        // Дополнительная настройка не требуется, так как Phaser применяет эти настройки автоматически
    }

    /**
     * Получить текст для отображения названия слова
     * @param {Object|string} wordData
     * @returns {string}
     */
    getWordDisplayText(wordData) {
        if (!wordData) {
            return '';
        }

        if (typeof wordData === 'string') {
            return wordData;
        }

        if (wordData.word) {
            return wordData.word;
        }

        if (wordData.label) {
            return wordData.label;
        }

        if (typeof wordData.value === 'string') {
            return wordData.value;
        }

        if (Array.isArray(wordData.letters)) {
            return wordData.letters.map(letter => letter.letter || '').join('');
        }

        return '';
    }

    /**
     * Удаляет текущую подсказку слова и обработчики
     */
    detachQuestionHoverLabel() {
        if (this.questionHoverTarget && this.questionHoverHandlers) {
            this.questionHoverTarget.off('pointerover', this.questionHoverHandlers.show);
            this.questionHoverTarget.off('pointerout', this.questionHoverHandlers.hide);
            this.questionHoverTarget.off('pointerup', this.questionHoverHandlers.hide);
        }

        this.questionHoverTarget = null;
        this.questionHoverHandlers = null;

        if (this.questionLabel && this.questionLabel.destroy) {
            this.questionLabel.destroy();
        }
        this.questionLabel = null;
    }

    /**
     * Создает подсказку с текстом слова при наведении
     * @param {string} hoverText
     * @param {number} imageRadius
     */
    setupQuestionHoverLabel(hoverText, imageRadius) {
        this.detachQuestionHoverLabel();

        if (!hoverText || !this.question) {
            return;
        }

        const minDimension = Math.min(this.scale.width, this.scale.height);
        const fontSize = 24;//Math.max(Math.round(minDimension / 22), 17);

        this.questionLabel = this.add.text(this.question.x, this.question.y, hoverText, {
            fontFamily: 'Arial',
            fontSize: `${fontSize}px`,
            fontStyle: 'bold',
            color: '#000000',
            align: 'center',
            wordWrap: { width: fontSize * 8, useAdvancedWrap: true }
        })
            .setOrigin(0.5)
            .setDepth(this.question.depth + 1)
            .setAlpha(0);

        this.questionLabel.setStroke('#ffffff', Math.max(2, Math.round(fontSize / 5)));
        this.questionLabel.setShadow(0, 0, 'rgba(0,0,0,0.35)', 6, true, true);

        // if (imageRadius) {
        //     this.question.setInteractive(
        //         new Phaser.Geom.Circle(0, 0, imageRadius),
        //         Phaser.Geom.Circle.Contains
        //     );
        // } else {
        //     this.question.setInteractive({ useHandCursor: false });
        // }

        this.question.setInteractive({ useHandCursor: false });

        const updatePosition = () => {
            if (this.question && this.questionLabel) {
                this.questionLabel.setPosition(this.question.x, this.question.y);
            }
        };

        const show = () => {
            updatePosition();
            if (this.questionLabel) {
                this.questionLabel.setAlpha(1);
            }
        };

        const hide = () => {
            if (this.questionLabel) {
                this.questionLabel.setAlpha(0);
            }
        };

        this.questionHoverTarget = this.question;
        this.questionHoverHandlers = { show, hide };

        this.question.on('pointerover', show);
        this.question.on('pointerout', hide);
        this.question.on('pointerup', hide);
    }

    /**
     * Скрывает текущую подсказку названия слова
     */
    hideQuestionHoverLabel() {
        if (this.questionLabel) {
            this.questionLabel.setAlpha(0);
        }
    }
    
    /**
     * Уничтожение сцены и очистка ресурсов
     */
    destroy() {
        // Уничтожаем все объекты
        if (this.question) {
            if (this.question.mask) {
                this.question.clearMask(false);
            }
            this.question = null;
        }

        this.detachQuestionHoverLabel();
        
        if (this.questionMask) {
            this.questionMask.destroy();
            this.questionMask = null;
        }
        
        if (this.soundToggleButton) {
            this.soundToggleButton.destroy(true);
            this.soundToggleButton = null;
        }
        this.soundToggleImage = null;
        this.soundToggleIconSize = null;
        
        // Очищаем массивы
        this.targets = [];
        this.targetLabels = [];
        
        // Очищаем ссылки
        this.gameConfig = null;
        this.currentWord = null;
        this.callbacks = null;
        this.background = null;
        this.questionBg = null;
        this.questionWhiteBg = null;
        this.header = null;
        this.headerBg = null;
        this.homeButton = null;
        
        // Вызываем родительский destroy
        super.destroy();
    }

    /**
     * Создание фона
     */
    createBackground() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.background = this.add.image(centerX, centerY, 'background')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height);
    }

    /**
     * Создание заголовка игры
     */
    createHeader() {
        const centerX = this.scale.width / 2;
        const headerY = this.scale.height * 0.08;
        const headerText = this.gameConfig.gameHeader || 'Логопедична гра';
        
        // Адаптивный размер шрифта на основе меньшей стороны (в 3 раза меньше)
        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 60, 16); // Уменьшено в 3 раза
        const headerFontSize = Math.round(Math.max(baseFontSize * 1.5, 14));

        
        // Сначала создаем текст чтобы узнать его размеры
        const tempText = this.add.text(centerX, headerY, headerText, {
            fontFamily: 'Arial',
            fontSize: `${headerFontSize}px`,
            color: '#000000',
            fontWeight: 'bold',
            align: 'center',
            resolution: 4
        })
            .setOrigin(0.5);
        
        // Получаем размеры текста
        const textWidth = tempText.width;
        const textHeight = tempText.height;
        
        // Создаем белый фон с отступами и скругленными краями
        const padding = 15; // Отступы вокруг текста
        const cornerRadius = 20; // Радиус скругления углов
        const bgWidth = textWidth + padding * 2;
        const bgHeight = textHeight + padding * 2;
        
        // Создаем фон для заголовка
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0xffffff, 1); // Белый цвет
        headerBg.fillRoundedRect(
            centerX - bgWidth / 2,
            headerY - bgHeight / 2,
            bgWidth,
            bgHeight,
            cornerRadius
        );
        headerBg.setDepth(0); // Фон внизу
        
        // Перемещаем текст поверх фона
        tempText.setDepth(1);
        
        // Сохраняем ссылки на элементы заголовка
        this.header = tempText;
        this.headerBg = headerBg;
    }

    /**
     * Создание кнопки возврата на главную
     */
    createHomeButton() {
        // return;
        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 30, 30);
        const buttonFontSize = Math.max(baseFontSize * 1.2, 18);
        
        // Позиция кнопки в левом верхнем углу
        const buttonX = this.scale.width * 0.1;
        const buttonY = this.scale.height * 0.08;
        const buttonText = 'На головну';
        
        // Создаем текст для расчета размеров
        const tempButtonText = this.add.text(buttonX, buttonY, buttonText, {
            fontFamily: 'Arial',
            fontSize: `${buttonFontSize}px`,
            color: '#000000',
            fontWeight: 'bold',
            resolution: 4
        })
            .setOrigin(0.5);
        
        // Получаем размеры текста
        const textWidth = tempButtonText.width;
        const textHeight = tempButtonText.height;
        
        // Размеры кнопки с отступами (имитируем стиль из CSS)
        const paddingX = 20;
        const paddingY = 10;
        const buttonWidth = textWidth + paddingX * 2;
        const buttonHeight = textHeight + paddingY * 2;
        
        // Создаем контейнер для кнопки
        const buttonContainer = this.add.container(buttonX, buttonY);
        
        // Оранжевый фон кнопки
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0xFFA12B, 1);
        buttonBg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            10
        );
        buttonContainer.add(buttonBg);
        
        // Черная граница
        const buttonBorder = this.add.graphics();
        buttonBorder.lineStyle(2, 0x000000, 1);
        buttonBorder.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            10
        );
        buttonContainer.add(buttonBorder);
        
        // Белый текст
        const finalButtonText = this.add.text(0, 0, buttonText, {
            fontFamily: 'Arial',
            fontSize: `${buttonFontSize}px`,
            color: '#FFFFFF',
            fontWeight: 'bold',
            resolution: 4
        })
            .setOrigin(0.5);
        buttonContainer.add(finalButtonText);
        
        // Удаляем временный текст
        tempButtonText.destroy();
        
        // Делаем кнопку интерактивной
        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive({useHandCursor: true});
        
        // Простая обратная связь при клике
        buttonContainer.on('pointerdown', () => {
            buttonContainer.setAlpha(0.7);
        });
        
        buttonContainer.on('pointerup', () => {
            buttonContainer.setAlpha(1);
            
            // Вызываем колбэк для возврата на главную
            if (this.callbacks && this.callbacks.onMainClick) {
                this.callbacks.onMainClick();
            }
        });
        
        buttonContainer.on('pointerout', () => {
            buttonContainer.setAlpha(1);
        });
        
        // Сохраняем ссылку на кнопку
        this.homeButton = buttonContainer;
    }

    createSoundToggleButton() {
        // return;
        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 30, 30);
        const buttonSize = Math.max(baseFontSize * 1.2, 36);

        const iconPadding = buttonSize * 0.4;
        const iconAreaSize = buttonSize;
        const buttonWidth = iconAreaSize + iconPadding * 2;
        const buttonHeight = iconAreaSize + iconPadding * 2;
        this.soundToggleIconSize = iconAreaSize;

        const buttonX = this.scale.width * 0.96;
        const buttonY = this.scale.height * 0.08;

        const buttonContainer = this.add.container(buttonX, buttonY);

        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0xFFA12B, 1);
        buttonBg.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            10
        );
        buttonContainer.add(buttonBg);

        const buttonBorder = this.add.graphics();
        buttonBorder.lineStyle(2, 0x000000, 1);
        buttonBorder.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            10
        );
        buttonContainer.add(buttonBorder);

        const textureKey = soundManager.isMuted ? 'sound-toggle-off' : 'sound-toggle-on';
        const iconImage = this.add.image(0, 0, textureKey);
        iconImage.setOrigin(0.5);
        iconImage.setDisplaySize(iconAreaSize, iconAreaSize);
        buttonContainer.add(iconImage);

        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive({useHandCursor: true});
        if (buttonContainer.input) {
            buttonContainer.input.cursor = 'pointer';
        }
        buttonContainer.setDepth(1000);

        const isLeftButtonDown = (pointer) => {
            if (typeof pointer.leftButtonDown === 'function') {
                return pointer.leftButtonDown();
            }
            return pointer.button === 0 || pointer.isPrimary;
        };

        const isLeftButtonReleased = (pointer) => {
            if (typeof pointer.leftButtonReleased === 'function') {
                return pointer.leftButtonReleased();
            }
            return pointer.button === 0 || pointer.isPrimary;
        };

        buttonContainer.on('pointerdown', (pointer) => {
            if (!isLeftButtonDown(pointer)) {
                return;
            }
            buttonContainer.setAlpha(0.7);
        });

        const resetButtonVisual = () => {
            buttonContainer.setAlpha(1);
        };

        buttonContainer.on('pointerup', (pointer) => {
            if (!isLeftButtonReleased(pointer)) {
                return;
            }
            resetButtonVisual();
            const muted = soundManager.toggleMute();
            this.applySoundMuteState(muted);
            this.updateSoundToggleIcon(muted);
        });

        buttonContainer.on('pointerupoutside', (pointer) => {
            if (isLeftButtonReleased(pointer)) {
                resetButtonVisual();
            }
        });

        buttonContainer.on('pointerout', resetButtonVisual);

        this.soundToggleButton = buttonContainer;
        this.soundToggleImage = iconImage;
        this.updateSoundToggleIcon(soundManager.isMuted);
    }

    updateSoundToggleIcon(isMuted) {
        if (!this.soundToggleImage) {
            return;
        }
        const textureKey = isMuted ? 'sound-toggle-off' : 'sound-toggle-on';
        this.soundToggleImage.setTexture(textureKey);
        if (this.soundToggleIconSize) {
            this.soundToggleImage.setDisplaySize(this.soundToggleIconSize, this.soundToggleIconSize);
        }
    }

    applySoundMuteState(isMuted) {
        if (!this.sound) {
            return;
        }

        if (typeof this.sound.setMute === 'function') {
            this.sound.setMute(isMuted);
        } else {
            this.sound.mute = isMuted;
        }

        if (isMuted && typeof this.sound.stopAll === 'function') {
            this.sound.stopAll();
        }
    }

    /**
     * Создание картинки вопроса
     */
    createQuestion(layoutConfig) {
        const centerX = this.scale.width / 2;
        const questionYPercent = layoutConfig.question?.yPercent;
        const questionY = this.scale.height * questionYPercent;
        const wordDataForHover = this.currentWord || this.gameConfig.currentWord;

        // Вычисляем позицию картинки и белого фона с учетом topOffset (в процентах от высоты экрана)
        // Фон элемента (questionBg) остается на questionY, а картинка и белый фон сдвигаются
        const topOffset = layoutConfig.question?.topOffset;
        const questionImageY = topOffset !== undefined 
            ? questionY + (this.scale.height * topOffset)
            : questionY;

        // Размер картинки вопроса
        const questionSizePercent = layoutConfig.question?.sizePercent;
        const questionSize = Math.min(
            this.scale.width * questionSizePercent,
            this.scale.height * questionSizePercent
        );

        // Выбираем случайный фон
        const backgrounds = this.gameConfig.wordConfig?.backgrounds || [];
        const bgIndex = Math.floor(Math.random() * backgrounds.length);
        const bgKey = backgrounds.length > 0 ? `question-bg-${bgIndex}` : null;

        if (bgKey) {
            this.questionBg = this.add.image(centerX, questionY, bgKey)
                .setOrigin(0.5)
                .setDisplaySize(questionSize, questionSize);
        }

        // Создаем белый круглый фон для картинки (с padding эффектом)
        const whiteBgRadius = questionSize * (layoutConfig.question?.maskRadiusPercent || 0.4);
        const paddingPercent = layoutConfig.question?.paddingPercent || 0.15; // 15% padding
        const imageRadius = whiteBgRadius * (1 - paddingPercent); // Радиус для картинки с учетом padding
        
        // Сохраняем радиусы для использования в анимациях
        this.whiteBgRadius = whiteBgRadius;
        this.imageRadius = imageRadius;

        // Создаем белый круглый фон
        if (!this.questionWhiteBg || !this.questionWhiteBg.active) {
            this.questionWhiteBg = this.add.graphics();
            this.questionWhiteBg.fillStyle(0xffffff, 1);
            this.questionWhiteBg.fillCircle(centerX, questionImageY, whiteBgRadius);
            this.questionWhiteBg.setDepth(1); // Выше questionBg, но ниже картинки
        }

        // Создаем маску для круглой картинки
        // Удаляем старую маску если существует
        if (this.questionMask) {
            this.questionMask.destroy();
            this.questionMask = null;
        }
        
        // Создаем новую маску с правильным радиусом
        const maskGraphics = this.make.graphics();
        maskGraphics.fillCircle(centerX, questionImageY, imageRadius);
        this.questionMask = maskGraphics;
        const mask = this.questionMask.createGeometryMask();

        // Картинка вопроса с маской - сохраняем пропорции
        if (this.textures.exists('question')) {
            const questionImg = this.textures.get('question');
            const questionAspectRatio = questionImg ? questionImg.source[0].width / questionImg.source[0].height : 1;

            // Размер картинки должен помещаться в белый круг с padding
            // Максимальный диаметр внутреннего круга
            const maxDiameter = imageRadius * 2;
            
            // Для прямоугольной картинки, чтобы она поместилась в круг без обрезки,
            // диагональ должна быть <= диаметру круга
            // Диагональ = sqrt(width^2 + height^2)
            // Если width = maxSize, height = maxSize / aspectRatio
            // Диагональ = sqrt(maxSize^2 + (maxSize/aspectRatio)^2) = maxSize * sqrt(1 + 1/aspectRatio^2)
            // maxSize = maxDiameter / sqrt(1 + 1/aspectRatio^2)
            
            const diagonalFactor = Math.sqrt(1 + 1 / (questionAspectRatio * questionAspectRatio));
            const maxSize = maxDiameter / diagonalFactor * 0.90; // 90% для большей безопасности
            
            // Рассчитываем размер с учетом пропорций
            let questionWidth, questionHeight;
            if (questionAspectRatio >= 1) {
                // Ширина больше или равна высоте
                questionWidth = maxSize;
                questionHeight = questionWidth / questionAspectRatio;
            } else {
                // Высота больше ширины
                questionHeight = maxSize;
                questionWidth = questionHeight * questionAspectRatio;
            }
            
            // Финальная проверка - диагональ должна быть меньше диаметра
            const diagonal = Math.sqrt(questionWidth * questionWidth + questionHeight * questionHeight);
            if (diagonal > maxDiameter * 0.90) {
                const scale = (maxDiameter * 0.90) / diagonal;
                questionWidth *= scale;
                questionHeight *= scale;
            }

            // Удаляем старое изображение если существует
            if (this.question && this.question.active) {
                this.question.destroy();
            }

            this.question = this.add.image(centerX, questionImageY, 'question')
                .setOrigin(0.5)
                .setDisplaySize(questionWidth, questionHeight)
                .setMask(mask)
                .setDepth(2); // Выше белого фона

            const hoverText = this.getWordDisplayText(wordDataForHover);
            this.setupQuestionHoverLabel(hoverText, imageRadius);
            
            // Убеждаемся что клики разрешены при первой загрузке
            this.isProcessingAnswer = false;
        } else {
            // Если текстура еще не загружена, создаем placeholder или ждем
            console.warn('Question texture not loaded yet, path:', this.currentWord?.img || this.gameConfig.currentWord?.img);
            // Разблокируем клики даже если текстура не загружена (будет обработано позже)
            this.isProcessingAnswer = false;
        }
    }

    /**
     * Создание целей
     */
    createTargets(layoutConfig) {
        const currentTargets = this.gameConfig.currentTargets || [];
        const targetsYPercent = layoutConfig.targets?.yPercent;
        const targetsY = this.scale.height * targetsYPercent;

        // Размер целей - только ширина из конфига
        const targetWidthPercent = layoutConfig.targets?.sizePercent;
        const targetBaseWidth = this.scale.width * targetWidthPercent;

        console.log('targetBaseWidth', targetBaseWidth)

        // Вычисляем позиционирование
        const targetsCount = currentTargets.length;

        let spacingPercent = this.paddingPercent(targetsCount);

        // Рассчитываем реальные размеры таргетов с учетом пропорций
        const targetConfigs = this.gameConfig.targetConfigs[this.gameConfig.gameType] || [];
        const targetSizes = [];
        let totalTargetsWidth = 0;

        targetConfigs.forEach((targetConfig, index) => {
            const targetKey = `target-${index}`;
            if (this.textures.exists(targetKey)) {
                const targetTexture = this.textures.get(targetKey);
                const aspectRatio = targetTexture.source[0].width / targetTexture.source[0].height;
                const targetWidth = targetBaseWidth;
                const targetHeight = targetWidth / aspectRatio;
                console.log('targetWidth', {width: targetWidth, height: targetHeight});

                targetSizes.push({width: targetWidth, height: targetHeight});
                totalTargetsWidth += targetWidth;
            } else {
                console.log("Fallback");
                // Fallback если текстура не загружена
                targetSizes.push({width: targetBaseWidth, height: targetBaseWidth});
                totalTargetsWidth += targetBaseWidth;
            }
        });

        console.log('targets size1', JSON.stringify(targetSizes));
        console.log('totalTargetsWidth', totalTargetsWidth);

        // Равномерное распределение таргетов с одинаковыми отступами слева и справа
        // Минимальный отступ по краям (используем spacingPercent для расчета минимального отступа)
        const minSidePadding = this.scale.width * spacingPercent;
        
        // Доступная ширина для таргетов и промежутков между ними
        const availableWidth = this.scale.width - (minSidePadding * 2);
        
        // Если таргеты не помещаются, уменьшаем их размер
        let scaleFactor = 1;
        if (totalTargetsWidth > availableWidth) {
            scaleFactor = availableWidth / totalTargetsWidth;
        }

        // Корректируем размеры с учетом scaleFactor
        targetSizes.forEach(size => {
            size.width *= scaleFactor;
            size.height *= scaleFactor;
        });
        totalTargetsWidth *= scaleFactor;

        console.log('targets size2', JSON.stringify(targetSizes));

        // Рассчитываем равномерное распределение
        // Если таргетов 1, он будет по центру
        // Если больше 1, равномерно распределяем промежутки между ними
        let spacingBetween = 0;
        let sidePadding = minSidePadding;
        
        if (targetsCount === 1) {
            // Один таргет - центрируем
            sidePadding = (this.scale.width - totalTargetsWidth) / 2;
        } else if (targetsCount > 1) {
            // Несколько таргетов - равномерно распределяем
            // Общая ширина промежутков между таргетами
            const totalSpacingWidth = availableWidth - totalTargetsWidth;
            // Количество промежутков между таргетами
            const gapsCount = targetsCount - 1;
            // Равномерный промежуток между таргетами
            spacingBetween = totalSpacingWidth / gapsCount;
            // Пересчитываем sidePadding чтобы обеспечить одинаковые отступы
            // (может быть больше minSidePadding если таргеты маленькие)
            sidePadding = (this.scale.width - totalTargetsWidth - (spacingBetween * gapsCount)) / 2;
        }

        // Стартовая позиция первого таргета (центр первого таргета)
        const startX = sidePadding + targetSizes[0].width / 2;

        // Размер шрифта для меток
        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 20, 16);
        const letterFontSize = Math.max(baseFontSize * 1.2, 24);

        // Создаем цели
        let currentX = startX;
        currentTargets.forEach((targetData, index) => {
            // Находим конфиг цели из targetConfigs
            const targetConfigs = this.gameConfig.targetConfigs[this.gameConfig.gameType] || [];
            const targetConfig = targetConfigs[index];

            if (!targetConfig) {
                return;
            }

            const targetSize = targetSizes[index];
            const targetX = currentX;
            const targetKey = `target-${index}`;

            // Создаем цель с реальными пропорциями
            const target = this.add.image(targetX, targetsY, targetKey)
                .setOrigin(0.5)
                .setVisible(false)
                .setDisplaySize(targetSize.width, targetSize.height)
                .setInteractive({useHandCursor: true})
                .on('pointerdown', () => this.checkAnswer(target, index));

            this.targets.push(target);

            // Обновляем позицию X для следующего таргета
            currentX += targetSize.width + spacingBetween;

            // Создаем метку
            const labelY = targetsY + targetSize.height / 2 + letterFontSize / 2 + letterFontSize * 0.75;

            // Фон для метки
            const labelWidth = letterFontSize * 1.5;
            const labelHeight = letterFontSize * 1.5;
            const labelRadius = letterFontSize * 0.3;

            // Создаем контейнер для лейбла
            const labelContainer = this.add.container(targetX, labelY);

            // Фон для метки (в контейнере координаты относительно контейнера)
            const labelBg = this.add.graphics();
            labelBg.fillStyle(0xffffff, 1);
            labelBg.fillRoundedRect(
                -labelWidth / 2,
                -labelHeight / 2,
                labelWidth,
                labelHeight,
                labelRadius
            );
            labelContainer.add(labelBg);

            // Текст метки - обрабатываем HTML
            let labelText = targetData.label || '';
            let labelImageKey = `target-label-${index}`;
            let labelImage = null;
            let label = null;

            // Проверяем если это HTML с изображением
            if (labelText.includes('<img')) {
                const imgMatch = labelText.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch && imgMatch[1]) {
                    // Проверяем существует ли текстура
                    if (this.textures.exists(labelImageKey)) {
                        // Создаем изображение вместо текста (в контейнере координаты относительно контейнера)
                        const labelImageSize = letterFontSize * 1.2;
                        labelImage = this.add.image(0, 0, labelImageKey)
                            .setOrigin(0.5)
                            .setDisplaySize(labelImageSize, labelImageSize);
                        labelContainer.add(labelImage);
                    } else {
                        // Если текстура не загружена, используем пустой текст
                        labelText = '';
                    }
                } else {
                    // Если не удалось найти src, используем пустой текст
                    labelText = '';
                }
            }

            // Создаем текст только если нет изображения (в контейнере координаты относительно контейнера)
            if (!labelImage) {
                label = this.add.text(0, 0, labelText, {
                    fontFamily: 'Arial',
                    fontSize: `${letterFontSize}px`,
                    color: '#000',
                    fontWeight: 'bold',
                    resolution: 4
                })
                    .setOrigin(0.5);
                labelContainer.add(label);
            }

            // Делаем контейнер интерактивным
            labelContainer.setSize(labelWidth, labelHeight);
            labelContainer.setInteractive({useHandCursor: true});
            labelContainer.on('pointerdown', () => this.checkAnswer(target, index));

            this.targetLabels.push({container: labelContainer, bg: labelBg, text: label, image: labelImage});
        });

        // Показываем все цели после настройки
        this.time.delayedCall(100, () => {
            this.targets.forEach(target => {
                if (target && target.active) {
                    target.setVisible(true);
                }
            });
        });
    }

    /**
     * Проверка ответа
     */
    checkAnswer(target, targetIndex) {
        // Блокируем повторные клики во время обработки ответа
        if (this.isProcessingAnswer) {
            return;
        }

        const correctAnswer = this.gameConfig.currentTargets?.[targetIndex]?.value;
        const userAnswer = this.gameConfig.currentTargets?.[targetIndex]?.value;
        const itemValue = this.gameConfig.currentItemValue;

        if (userAnswer === itemValue) {
            this.handleSuccess(target, targetIndex);
        } else {
            this.handleFail(target, targetIndex);
        }
    }

    /**
     * Обработка правильного ответа
     */
    handleSuccess(target, targetIndex) {
        // Блокируем клики
        this.isProcessingAnswer = true;
        
        // Отключаем интерактивность всех таргетов
        this.targets.forEach(t => {
            if (t && t.active) {
                t.disableInteractive();
            }
        });
        this.targetLabels.forEach(labelObj => {
            if (labelObj && labelObj.container && labelObj.container.active) {
                labelObj.container.disableInteractive();
            }
        });

        // Определяем тип анимации
        if (this.gameConfig.animationType === 'move_to_item_and_firework') {
            this.animateFirework(target, targetIndex);
        } else {
            this.animateMoveToTarget(target, targetIndex);
        }
    }

    /**
     * Обработка неправильного ответа
     */
    handleFail(target, targetIndex) {
        // Блокируем клики
        if (this.isProcessingAnswer) {
            return;
        }
        
        this.isProcessingAnswer = true;
        
        // Отключаем интерактивность всех таргетов
        this.targets.forEach(t => {
            if (t && t.active) {
                t.disableInteractive();
            }
        });
        this.targetLabels.forEach(labelObj => {
            if (labelObj && labelObj.container && labelObj.container.active) {
                labelObj.container.disableInteractive();
            }
        });

        // Воспроизводим звук ошибки
        this.sound.add('fail', {volume: 0.7}).play();

        // Анимация дрожания таргета
        const originalX = target.x;
        const originalY = target.y;

        // Отслеживаем завершение анимаций
        let animationsCompleted = 0;
        let totalAnimations = 1; // Минимум одна анимация (таргет)
        
        // Проверяем есть ли лейбл для анимации
        const hasLabel = this.targetLabels && this.targetLabels[targetIndex] && this.targetLabels[targetIndex].container;
        if (hasLabel) {
            totalAnimations = 2; // таргет + лейбл
        }
        
        const checkAndUnlock = () => {
            animationsCompleted++;
            if (animationsCompleted >= totalAnimations) {
                // Разблокируем клики после завершения всех анимаций
                this.isProcessingAnswer = false;
                
                // Включаем обратно интерактивность всех таргетов
                this.targets.forEach(t => {
                    if (t && t.active) {
                        t.setInteractive({useHandCursor: true});
                    }
                });
                this.targetLabels.forEach(labelObj => {
                    if (labelObj && labelObj.container && labelObj.container.active) {
                        labelObj.container.setInteractive({useHandCursor: true});
                    }
                });
            }
        };

        this.tweens.add({
            targets: target,
            x: originalX + 15,
            y: originalY,
            yoyo: true,
            repeat: 5,
            duration: 50,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                target.setPosition(originalX, originalY);
                checkAndUnlock();
            }
        });

        // Анимация дрожания лейбла если он существует
        if (hasLabel) {
            const labelObj = this.targetLabels[targetIndex];
            const labelContainer = labelObj.container;
            const originalLabelX = labelContainer.x;
            const originalLabelY = labelContainer.y;

            this.tweens.add({
                targets: labelContainer,
                x: originalLabelX + 15,
                y: originalLabelY,
                yoyo: true,
                repeat: 5,
                duration: 50,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    labelContainer.setPosition(originalLabelX, originalLabelY);
                    checkAndUnlock();
                }
            });
        }
    }

    /**
     * Анимация перемещения к цели
     */
    animateMoveToTarget(target, targetIndex) {
        this.sound.add('success', {volume: 0.7}).play();

        // Сохраняем позиции и размеры
        const questionX = this.question.x;
        const questionY = this.question.y;
        const questionWidth = this.question.displayWidth;
        const questionHeight = this.question.displayHeight;

        // Получаем радиусы для фона и маски (используем сохраненные значения или пересчитываем)
        let whiteBgRadius = this.whiteBgRadius;
        let imageRadius = this.imageRadius;
        
        if (!whiteBgRadius || !imageRadius) {
            // Если радиусы не сохранены, пересчитываем
            const layoutConfig = this.gameConfig?.layoutConfig || {};
            const questionSizePercent = layoutConfig.question?.sizePercent;
            const questionSize = Math.min(
                this.scale.width * questionSizePercent,
                this.scale.height * questionSizePercent
            );
            whiteBgRadius = questionSize * (layoutConfig.question?.maskRadiusPercent || 0.4);
            const paddingPercent = layoutConfig.question?.paddingPercent || 0.15;
            imageRadius = whiteBgRadius * (1 - paddingPercent);
        }

        // Скрываем оригинальные элементы
        this.question.setAlpha(0);
        if (this.questionBg) {
            this.questionBg.setAlpha(0);
        }
        if (this.questionWhiteBg) {
            this.questionWhiteBg.setAlpha(0);
        }
        this.hideQuestionHoverLabel();

        // Создаем контейнер для анимации с правильной глубиной
        const questionContainer = this.add.container(questionX, questionY);
        questionContainer.setDepth(100); // Очень высокий depth для отображения поверх всего

        // Добавляем копию фоновой картинки (если есть) чтобы она участвовала в анимации
        if (this.questionBg && this.questionBg.texture) {
            const bgCopyOffsetY = this.questionBg.y - questionY; // сохраняем относительный сдвиг
            const questionBgCopy = this.add.image(0, bgCopyOffsetY, this.questionBg.texture.key)
                .setOrigin(0.5)
                .setDisplaySize(this.questionBg.displayWidth, this.questionBg.displayHeight);
            questionContainer.add(questionBgCopy);
        }

        // Добавляем белый круглый фон в контейнер (располагается поверх фоновой картинки)
        const whiteBgCopy = this.add.graphics();
        whiteBgCopy.clear(); // Очищаем перед рисованием
        whiteBgCopy.fillStyle(0xffffff, 1);
        whiteBgCopy.fillCircle(0, 0, whiteBgRadius);
        questionContainer.add(whiteBgCopy);

        // Добавляем копию картинки вопроса в контейнер
        const questionCopy = this.add.image(0, 0, 'question')
            .setOrigin(0.5)
            .setDisplaySize(questionWidth, questionHeight)
            .setAlpha(1); // Явно устанавливаем альфу
        questionCopy.setDepth(1); // Верхний слой в контейнере (над фоном)
        questionContainer.add(questionCopy);
        
        // Создаем маску для круглой картинки
        // Маска создается как обычный graphics объект и добавляется на сцену (но невидимый)
        // Это нужно для корректной работы маски при масштабировании
        const maskGraphics = this.add.graphics();
        maskGraphics.setVisible(false);
        maskGraphics.setActive(false); // Делаем неактивным, чтобы не обновлялся
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillCircle(questionX, questionY, imageRadius);
        const copyMask = maskGraphics.createGeometryMask();
        
        // Применяем маску к изображению
        // Маска привязана к позиции сцены, но будет масштабироваться с контейнером
        questionCopy.setMask(copyMask);
        
        // Сохраняем ссылку на маску для обновления при анимации
        questionContainer.setData('maskGraphics', maskGraphics);
        questionContainer.setData('maskRadius', imageRadius);

        // Убеждаемся что контейнер видим в начале анимации
        questionContainer.setAlpha(1);
        
        // Анимация движения, уменьшения и исчезновения
        // Обновляем маску при масштабировании контейнера
        this.tweens.add({
            targets: questionContainer,
            x: target.x,
            y: target.y,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: 600,
            ease: 'Power2.easeIn',
            onUpdate: () => {
                // Обновляем позицию и размер маски при масштабировании
                const currentScale = questionContainer.scaleX || 1;
                const currentX = questionContainer.x;
                const currentY = questionContainer.y;
                const currentRadius = imageRadius * currentScale;
                
                // Альфа контейнера автоматически применяется ко всем дочерним элементам
                // Не нужно отдельно управлять альфой белого фона
                
                maskGraphics.clear();
                maskGraphics.fillStyle(0xffffff);
                maskGraphics.fillCircle(currentX, currentY, currentRadius);
            }
        });
        
        // Отдельная анимация для альфы (чтобы она исчезала в конце)
        this.tweens.add({
            targets: questionContainer,
            alpha: 0,
            duration: 500,
            delay: 100, // Небольшая задержка чтобы сначала уменьшалось
            ease: 'Power2.easeIn',
            onComplete: () => {
                // Очищаем маску перед уничтожением контейнера
                if (questionCopy && questionCopy.mask) {
                    questionCopy.clearMask(false);
                }
                // Уничтожаем graphics маски
                if (maskGraphics && maskGraphics.active) {
                    maskGraphics.destroy();
                }
                // Уничтожаем контейнер (все содержимое уничтожится автоматически)
                questionContainer.destroy();

                // Восстанавливаем видимость оригинальных элементов не нужно - 
                // они уже скрыты и будут восстановлены при обновлении слова

                // Переход к следующему слову
                if (this.callbacks.onNextWord) {
                    this.callbacks.onNextWord();
                }
                
                // Блокировка остается активной до тех пор, пока новое слово не отрендерится
            }
        });
    }

    /**
     * Анимация фейерверка
     */
    animateFirework(target, targetIndex) {
        const questionX = this.question.x;
        const questionY = this.question.y;

        // Отключаем интерактивность
        this.targets.forEach(t => t.disableInteractive());

        // Скрываем элементы
        this.question.setAlpha(0);
        if (this.questionBg) {
            this.questionBg.setAlpha(0);
        }
        if (this.questionWhiteBg) {
            this.questionWhiteBg.setAlpha(0);
        }
        this.targetLabels.forEach(labelObj => {
            // Скрываем контейнер целиком
            if (labelObj.container) {
                labelObj.container.setAlpha(0);
            }
        });
        this.hideQuestionHoverLabel();

        // Сохраняем исходные позиции ракет для восстановления
        const targetOriginalPositions = this.targets.map(t => ({
            x: t.x,
            y: t.y,
            scaleX: t.scaleX,
            scaleY: t.scaleY
        }));

        // Скрываем другие цели
        this.targets.forEach((t, i) => {
            if (i !== targetIndex) {
                t.setAlpha(0);
            }
        });

        // Звук запуска ракеты
        const whistleSound = this.sound.add('fireworksStart', {volume: 0.7});
        whistleSound.play();

        // Сохраняем исходные параметры ракеты перед анимацией
        const originalTargetX = target.x;
        const originalTargetY = target.y;
        const originalScaleX = target.scaleX;
        const originalScaleY = target.scaleY;

        // Движение ракеты к вопросу
        this.tweens.add({
            targets: target,
            x: questionX,
            y: questionY,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: 1000,
            ease: 'Power2.easeIn',
            onComplete: () => {
                whistleSound.stop();
                // Временно скрываем ракету вместо удаления
                target.setAlpha(0);
                target.setPosition(originalTargetX, originalTargetY);
                target.setScale(originalScaleX, originalScaleY);
                target.setVisible(false);
                this.createFirework(questionX, questionY);
            }
        });
    }

    /**
     * Создание частиц для салютов
     */
    createFireworkParticles() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(0, 0, 6);
        graphics.generateTexture('particle', 12, 12);
        graphics.destroy();
    }

    /**
     * Создание фейерверка
     */
    async createFirework(x, y) {
        x = 320;//fixme
        y = 100;//fixme

        console.log("createFirework", x, y);
        const explodeSound = this.sound.add('fireworksExplode', {volume: 0.7});
        explodeSound.play();

        const colors = [
            [0xff0000, 0xff6600, 0xffaa00],
            [0x00ff00, 0x00ff88, 0x88ff00],
            [0x0000ff, 0x0088ff, 0x00ffff],
            [0xffff00, 0xffaa00, 0xff6600],
            [0xff00ff, 0xff0088, 0xff0088],
            [0x00ffff, 0x00aaff, 0x0088ff],
        ];

        const particleSystems = [];

        for (let i = 0; i < 3; i++) {
            colors.forEach((colorGroup, index) => {
                const particles = this.add.particles(x, y, 'particle', {
                    speed: {min: 100, max: 300},
                    scale: {start: 1.2, end: 0},
                    lifespan: 1000,
                    tint: colorGroup,
                    gravityY: 60,
                    blendMode: 'ADD',
                    emitting: false
                });

                particles.explode(30, x, y);
                particleSystems.push(particles);
            });

            const whiteParticles = this.add.particles(x, y, 'particle', {
                speed: {min: 150, max: 350},
                scale: {start: 1.5, end: 0},
                lifespan: 1000,
                tint: 0xffffff,
                gravityY: 40,
                blendMode: 'ADD',
                emitting: false
            });

            whiteParticles.explode(30, x, y);
            particleSystems.push(whiteParticles);

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.time.delayedCall(100, () => {
            particleSystems.forEach(ps => {
                if (ps && ps.active) {
                    ps.destroy();
                }
            });
            explodeSound.stop();

            // Восстанавливаем видимость всех элементов перед переходом к следующему слову
            this.restoreGameElements();

            // Переход к следующему слову
            if (this.callbacks.onNextWord) {
                this.callbacks.onNextWord();
            }
            
            // Блокировка остается активной до тех пор, пока новое слово не отрендерится
        });
    }

    /**
     * Восстановление игровых элементов (ракеты, метки и т.д.)
     */
    restoreGameElements() {
        const layoutConfig = this.gameConfig.layoutConfig;
        const currentTargets = this.gameConfig.currentTargets || [];
        const targetsYPercent = layoutConfig.targets?.yPercent;
        const targetsY = this.scale.height * targetsYPercent;

        // Рассчитываем позиции заново используя ту же логику что и в createTargets
        const targetWidthPercent = layoutConfig.targets?.sizePercent;
        const targetBaseWidth = this.scale.width * targetWidthPercent;
        const targetsCount = currentTargets.length;

        let spacingPercent = this.paddingPercent(targetsCount);
        const targetConfigs = this.gameConfig.targetConfigs[this.gameConfig.gameType] || [];

        // Рассчитываем размеры таргетов
        const targetSizes = [];
        let totalTargetsWidth = 0;

        targetConfigs.forEach((targetConfig, index) => {
            const targetKey = `target-${index}`;
            if (this.textures.exists(targetKey)) {
                const targetTexture = this.textures.get(targetKey);
                const aspectRatio = targetTexture.source[0].width / targetTexture.source[0].height;
                const targetWidth = targetBaseWidth;
                const targetHeight = targetWidth / aspectRatio;
                targetSizes.push({width: targetWidth, height: targetHeight});
                totalTargetsWidth += targetWidth;
            } else {
                targetSizes.push({width: targetBaseWidth, height: targetBaseWidth});
                totalTargetsWidth += targetBaseWidth;
            }
        });

        // Равномерное распределение таргетов с одинаковыми отступами слева и справа
        // Минимальный отступ по краям (используем spacingPercent для расчета минимального отступа)
        const minSidePadding = this.scale.width * spacingPercent;
        
        // Доступная ширина для таргетов и промежутков между ними
        const availableWidth = this.scale.width - (minSidePadding * 2);
        
        // Если таргеты не помещаются, уменьшаем их размер
        let scaleFactor = 1;
        if (totalTargetsWidth > availableWidth) {
            scaleFactor = availableWidth / totalTargetsWidth;
        }

        // Корректируем размеры с учетом scaleFactor
        targetSizes.forEach(size => {
            size.width *= scaleFactor;
            size.height *= scaleFactor;
        });
        totalTargetsWidth *= scaleFactor;

        // Рассчитываем равномерное распределение
        // Если таргетов 1, он будет по центру
        // Если больше 1, равномерно распределяем промежутки между ними
        let spacingBetween = 0;
        let sidePadding = minSidePadding;
        
        if (targetsCount === 1) {
            // Один таргет - центрируем
            sidePadding = (this.scale.width - totalTargetsWidth) / 2;
        } else if (targetsCount > 1) {
            // Несколько таргетов - равномерно распределяем
            // Общая ширина промежутков между таргетами
            const totalSpacingWidth = availableWidth - totalTargetsWidth;
            // Количество промежутков между таргетами
            const gapsCount = targetsCount - 1;
            // Равномерный промежуток между таргетами
            spacingBetween = totalSpacingWidth / gapsCount;
            // Пересчитываем sidePadding чтобы обеспечить одинаковые отступы
            // (может быть больше minSidePadding если таргеты маленькие)
            sidePadding = (this.scale.width - totalTargetsWidth - (spacingBetween * gapsCount)) / 2;
        }

        // Стартовая позиция первого таргета (центр первого таргета)
        const startX = sidePadding + targetSizes[0].width / 2;
        let currentX = startX;

        // Восстанавливаем все ракеты с правильными позициями
        this.targets.forEach((target, index) => {
            if (!target || !target.active) {
                // Если ракета была удалена, пересоздаем её
                if (index < currentTargets.length && index < targetConfigs.length) {
                    const targetSize = targetSizes[index];
                    const targetKey = `target-${index}`;
                    const targetX = currentX;

                    const newTarget = this.add.image(targetX, targetsY, targetKey)
                        .setOrigin(0.5)
                        .setDisplaySize(targetSize.width, targetSize.height)
                        .setInteractive({useHandCursor: true})
                        .on('pointerdown', () => this.checkAnswer(newTarget, index));

                    this.targets[index] = newTarget;
                    currentX += targetSize.width + spacingBetween;
                }
            } else {
                // Восстанавливаем существующую ракету с правильной позицией
                const targetSize = targetSizes[index];
                const targetX = currentX;

                target.setPosition(targetX, targetsY);
                target.setAlpha(1);
                target.setVisible(true);
                target.setInteractive({useHandCursor: true});
                target.setDisplaySize(targetSize.width, targetSize.height);

                currentX += targetSize.width + spacingBetween;
            }
        });

        // Восстанавливаем видимость меток и обновляем их позиции
        const minDimension = Math.min(this.scale.width, this.scale.height);
        const baseFontSize = Math.max(minDimension / 20, 16);
        const letterFontSize = Math.max(baseFontSize * 1.2, 24);

        currentX = startX;
        this.targetLabels.forEach((labelObj, index) => {
            if (index < targetSizes.length) {
                const targetSize = targetSizes[index];
                const targetX = currentX;
                const labelY = targetsY + targetSize.height / 2 + letterFontSize / 2 + letterFontSize * 0.75;
                const labelWidth = letterFontSize * 1.5;
                const labelHeight = letterFontSize * 1.5;
                const labelRadius = letterFontSize * 0.3;

                // Обновляем позицию контейнера
                if (labelObj.container) {
                    labelObj.container.setPosition(targetX, labelY);
                    labelObj.container.setAlpha(1);
                }

                // Обновляем фон внутри контейнера (координаты относительно контейнера)
                if (labelObj.bg) {
                    labelObj.bg.clear();
                    labelObj.bg.fillStyle(0xffffff, 1);
                    labelObj.bg.fillRoundedRect(
                        -labelWidth / 2,
                        -labelHeight / 2,
                        labelWidth,
                        labelHeight,
                        labelRadius
                    );
                }

                // Обновляем позицию текста/изображения метки (в контейнере координаты относительно контейнера)
                if (labelObj.text) {
                    labelObj.text.setPosition(0, 0);
                }
                if (labelObj.image) {
                    labelObj.image.setPosition(0, 0);
                }

                currentX += targetSize.width + spacingBetween;
            }
        });

        // Восстанавливаем видимость фона вопроса
        if (this.questionBg) {
            this.questionBg.setAlpha(1);
        }
        if (this.questionWhiteBg) {
            this.questionWhiteBg.setAlpha(1);
        }
    }


    /**
     * Обновление картинки вопроса (для плавного перехода)
     */
    async updateWord(newWord) {
        if (!newWord || !newWord.img) {
            return;
        }

        // Восстанавливаем игровые элементы на случай если они были скрыты
        this.restoreGameElements();

        // Обновляем currentWord
        this.currentWord = newWord;
        if (this.gameConfig) {
            this.gameConfig.currentWord = newWord;
        }

        const layoutConfig = this.gameConfig.layoutConfig;
        const questionSizePercent = layoutConfig.question?.sizePercent;
        const questionSize = Math.min(
            this.scale.width * questionSizePercent,
            this.scale.height * questionSizePercent
        );

        // Плавно скрываем старое изображение
        if (this.question && this.question.active) {
            // Сохраняем ссылку на старое изображение для удаления
            const oldQuestion = this.question;
            this.detachQuestionHoverLabel();
            
            this.tweens.add({
                targets: oldQuestion,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 200,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    // Удаляем старое изображение и очищаем ссылку
                    if (oldQuestion && oldQuestion.active) {
                        // Удаляем маску со старого изображения если она есть
                        if (oldQuestion.mask) {
                            oldQuestion.clearMask(false);
                        }
                        oldQuestion.destroy();
                    }
                    this.question = null;

                    // Загружаем новую картинку
                    this.loadNewQuestionImage(newWord, questionSize, layoutConfig);
                }
            });
        } else {
            // Если изображения нет, загружаем сразу
            this.loadNewQuestionImage(newWord, questionSize, layoutConfig);
        }
    }

    /**
     * Загрузка нового изображения вопроса
     */
    loadNewQuestionImage(word, questionSize, layoutConfig) {
        const wordImagePath = `images/words/${word.img}`;
        const timestamp = Date.now();
        const wordImagePathWithCache = `${wordImagePath}?t=${timestamp}`;
        const centerX = this.scale.width / 2;
        const questionYPercent = layoutConfig.question?.yPercent;
        const questionY = this.scale.height * questionYPercent;

        // Вычисляем позицию картинки и белого фона с учетом topOffset (в процентах от высоты экрана)
        // Фон элемента (questionBg) остается на questionY, а картинка и белый фон сдвигаются
        const topOffset = layoutConfig.question?.topOffset;
        const questionImageY = topOffset !== undefined 
            ? questionY + (this.scale.height * topOffset)
            : questionY;

        // Создаем или обновляем белый круглый фон
        const whiteBgRadius = questionSize * (layoutConfig.question?.maskRadiusPercent || 0.4);
        if (!this.questionWhiteBg || !this.questionWhiteBg.active) {
            this.questionWhiteBg = this.add.graphics();
            this.questionWhiteBg.fillStyle(0xffffff, 1);
            this.questionWhiteBg.fillCircle(centerX, questionImageY, whiteBgRadius);
            this.questionWhiteBg.setDepth(1);
        } else {
            // Обновляем белый фон с правильным радиусом
            this.questionWhiteBg.clear();
            this.questionWhiteBg.fillStyle(0xffffff, 1);
            this.questionWhiteBg.fillCircle(centerX, questionImageY, whiteBgRadius);
            this.questionWhiteBg.setAlpha(1); // Убеждаемся что он видим
        }

        // Удаляем старую текстуру если существует
        if (this.textures.exists('question')) {
            this.textures.remove('question');
        }

        // Загружаем новое изображение
        this.load.image('question', wordImagePathWithCache);

        // Ждем загрузки и создаем изображение
        this.load.once('filecomplete-image-question', () => {
            // Настраиваем фильтры для новой текстуры
            this.setupTextureFilters();
            
            if (this.textures.exists('question')) {
                const questionImg = this.textures.get('question');
                const questionAspectRatio = questionImg ? questionImg.source[0].width / questionImg.source[0].height : 1;

                // Рассчитываем размеры с учетом padding (используем ту же логику что и в createQuestion)
                const whiteBgRadius = questionSize * (layoutConfig.question?.maskRadiusPercent || 0.4);
                const paddingPercent = layoutConfig.question?.paddingPercent || 0.15;
                const imageRadius = whiteBgRadius * (1 - paddingPercent);
                
                // Сохраняем радиусы для использования в анимациях
                this.whiteBgRadius = whiteBgRadius;
                this.imageRadius = imageRadius;
                
                // Максимальный диаметр внутреннего круга
                const maxDiameter = imageRadius * 2;
                
                // Для прямоугольной картинки, чтобы она поместилась в круг без обрезки,
                // диагональ должна быть <= диаметру круга
                const diagonalFactor = Math.sqrt(1 + 1 / (questionAspectRatio * questionAspectRatio));
                const maxSize = maxDiameter / diagonalFactor * 0.90; // 90% для большей безопасности
                
                // Рассчитываем размер с учетом пропорций
                let questionWidth, questionHeight;
                if (questionAspectRatio >= 1) {
                    // Ширина больше или равна высоте
                    questionWidth = maxSize;
                    questionHeight = questionWidth / questionAspectRatio;
                } else {
                    // Высота больше ширины
                    questionHeight = maxSize;
                    questionWidth = questionHeight * questionAspectRatio;
                }
                
                // Финальная проверка - диагональ должна быть меньше диаметра
                const diagonal = Math.sqrt(questionWidth * questionWidth + questionHeight * questionHeight);
                if (diagonal > maxDiameter * 0.90) {
                    const scale = (maxDiameter * 0.90) / diagonal;
                    questionWidth *= scale;
                    questionHeight *= scale;
                }

                // Создаем маску для картинки (пересоздаем каждый раз с правильным радиусом)
                // Удаляем старую маску если существует
                if (this.questionMask) {
                    this.questionMask.destroy();
                    this.questionMask = null;
                }
                
                // Создаем новую маску с правильным радиусом
                const maskGraphics = this.make.graphics();
                maskGraphics.fillStyle(0xffffff);
                maskGraphics.fillCircle(centerX, questionImageY, imageRadius);
                this.questionMask = maskGraphics;
                const mask = this.questionMask.createGeometryMask();

                // Создаем новое изображение с начальной прозрачностью
                this.question = this.add.image(centerX, questionImageY, 'question')
                    .setOrigin(0.5)
                    .setDisplaySize(questionWidth, questionHeight)
                    .setMask(mask)
                    .setAlpha(0)
                    .setDepth(2);

                const hoverText = this.getWordDisplayText(word);
                this.setupQuestionHoverLabel(hoverText, imageRadius);

                // Плавное появление нового изображения (только альфа, без масштаба)
                this.tweens.add({
                    targets: this.question,
                    alpha: 1,
                    duration: 300,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        // Разблокируем клики после полного рендеринга нового слова
                        this.isProcessingAnswer = false;
                        
                        // Включаем обратно интерактивность всех таргетов
                        this.targets.forEach(t => {
                            if (t && t.active) {
                                t.setInteractive({useHandCursor: true});
                            }
                        });
                        this.targetLabels.forEach(labelObj => {
                            if (labelObj && labelObj.container && labelObj.container.active) {
                                labelObj.container.setInteractive({useHandCursor: true});
                            }
                        });
                    }
                });
            }
        });

        // Запускаем загрузку
        this.load.start();
    }

    paddingPercent(targetsCount) {
        if (targetsCount == 2) {
            return 0.15; // 15% для 2 таргетов
        } else if (targetsCount == 3) {
            return 0.10; // 8% для 3 таргетов
        } else if (targetsCount == 4) {
            return 0.1; // 5% для 4 таргетов
        }

        return 0.1; // 10% по умолчанию
    }
}

