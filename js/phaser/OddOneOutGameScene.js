/**
 * Сцена для игры "Четвертий зайвий"
 */
import {BaseGameScene} from './BaseGameScene.js';
import {soundManager} from '../soundManager.js';

export class OddOneOutGameScene extends BaseGameScene {
    constructor(key) {
        super(key);
        this.wordImages = []; // Массив изображений слов
        this.wordContainers = []; // Массив контейнеров с белыми фонами
        this.currentWordSet = null; // Текущий набор из 4 слов
        this.isProcessingAnswer = false; // Флаг блокировки кликов
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

        // Загружаем звуки
        this.load.audio('success', 'sounds/success4.mp3');
        this.load.audio('fail', 'sounds/fail.mp3');

        if (!this.textures.exists('sound-toggle-on')) {
            this.load.image('sound-toggle-on', 'css/images/sound-on.png');
        }

        if (!this.textures.exists('sound-toggle-off')) {
            this.load.image('sound-toggle-off', 'css/images/sound-off.png');
        }

        // Загружаем картинки слов из текущего набора
        const wordSet = this.currentWord || this.gameConfig.currentWord;
        if (wordSet && wordSet.words) {
            wordSet.words.forEach((word, index) => {
                const wordImagePath = `images/words/${word.img}`;
                const wordKey = `word-${index}`;
                
                // Удаляем старую текстуру если существует
                if (this.textures.exists(wordKey)) {
                    this.textures.remove(wordKey);
                }
                
                // Добавляем timestamp для принудительной перезагрузки
                const timestamp = Date.now();
                const wordImagePathWithCache = `${wordImagePath}?t=${timestamp}`;
                this.load.image(wordKey, wordImagePathWithCache);
            });
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

        const wordSet = this.currentWord || this.gameConfig.currentWord;
        if (!wordSet || !wordSet.words) {
            console.error('Missing word set');
            return;
        }

        this.currentWordSet = wordSet;

        // Настраиваем фильтры текстур
        this.setupTextureFilters();

        // Создаем фон
        this.createBackground();

        // Создаем заголовок
        this.createHeader();

        // Создаем кнопку возврата
        this.createHomeButton();
        this.createSoundToggleButton();
        this.applySoundMuteState(soundManager.isMuted);

        // Создаем сетку из 4 слов (после загрузки текстур)
        if (wordSet.words.length === 4) {
            // Проверяем, загружены ли все текстуры
            const allLoaded = wordSet.words.every((word, index) => {
                const wordKey = `word-${index}`;
                return this.textures.exists(wordKey);
            });

            if (allLoaded) {
                this.createWordGrid(wordSet);
            } else {
                // Ждем загрузки всех текстур
                this.load.once('complete', () => {
                    this.setupTextureFilters();
                    this.createWordGrid(wordSet);
                });
                this.load.start();
            }
        }
    }

    /**
     * Создание сетки из 4 слов (2x2)
     */
    createWordGrid(wordSet) {
        // Очищаем старые элементы
        this.wordImages.forEach(img => {
            if (img && img.active) {
                img.destroy();
            }
        });
        this.wordContainers.forEach(container => {
            if (container && container.active) {
                container.destroy();
            }
        });
        this.wordImages = [];
        this.wordContainers = [];

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Размер каждого квадрата - 30% от высоты
        const squareSize = this.scale.height * 0.30;
        
        // Расстояние между картинками (10% от высоты)
        const spacing = this.scale.height * 0.1;
        
        // Расположение: 2x2 сетка с учетом расстояний
        // Позиции центров квадратов
        const positions = [
            { x: centerX - (squareSize + spacing) / 2, y: centerY - (squareSize + spacing) / 2 }, // Верхний левый
            { x: centerX + (squareSize + spacing) / 2, y: centerY - (squareSize + spacing) / 2 }, // Верхний правый
            { x: centerX - (squareSize + spacing) / 2, y: centerY + (squareSize + spacing) / 2 }, // Нижний левый
            { x: centerX + (squareSize + spacing) / 2, y: centerY + (squareSize + spacing) / 2 }  // Нижний правый
        ];

        const cornerRadius = 20; // Радиус скругления углов

        // Создаем контейнеры и картинки для каждого слова
        wordSet.words.forEach((word, index) => {
            const pos = positions[index];
            
            // Создаем контейнер для слова
            const container = this.add.container(pos.x, pos.y);
            container.setSize(squareSize, squareSize);
            // container.setInteractive(
            //     new Phaser.Geom.Rectangle(-squareSize / 2, -squareSize / 2, squareSize, squareSize),
            //     Phaser.Geom.Rectangle.Contains
            // );
            container.setInteractive({ useHandCursor: false });
            if (container.input) {
                container.input.cursor = 'pointer';
            }
            
            // Создаем белый фон с скругленными краями
            const bg = this.add.graphics();
            bg.fillStyle(0xffffff, 1);
            bg.fillRoundedRect(
                -squareSize / 2,
                -squareSize / 2,
                squareSize,
                squareSize,
                cornerRadius
            );
            container.add(bg);
            
            // Загружаем картинку слова
            const wordKey = `word-${index}`;
            if (this.textures.exists(wordKey)) {
                const wordImg = this.add.image(0, 0, wordKey)
                    .setOrigin(0.5);
                
                // Рассчитываем размер картинки с сохранением пропорций
                const texture = this.textures.get(wordKey);
                const aspectRatio = texture.source[0].width / texture.source[0].height;
                
                let imgWidth, imgHeight;
                const padding = squareSize * 0.1; // 10% padding
                const availableSize = squareSize - padding * 2;
                
                if (aspectRatio >= 1) {
                    // Ширина больше или равна высоте
                    imgWidth = Math.min(availableSize, availableSize * aspectRatio);
                    imgHeight = imgWidth / aspectRatio;
                } else {
                    // Высота больше ширины
                    imgHeight = Math.min(availableSize, availableSize / aspectRatio);
                    imgWidth = imgHeight * aspectRatio;
                }
                
                wordImg.setDisplaySize(imgWidth, imgHeight);
                
                // Сохраняем индекс слова для обработки клика
                wordImg.setData('wordIndex', index);
                wordImg.setData('isOddOneOut', index === wordSet.oddOneOutIndex);

                const labelFontSize = 24;//Math.max(Math.round(squareSize * 0.18), 26);
                const wordLabel = this.add.text(0, 0, word?.word || '', {
                    fontFamily: 'Arial',
                    fontSize: `${labelFontSize}px`,
                    fontStyle: 'bold',
                    color: '#000000',
                    align: 'center',
                    wordWrap: { width: squareSize * 0.8, useAdvancedWrap: true }
                })
                    .setOrigin(0.5)
                    .setAlpha(0);
                wordLabel.setStroke('#ffffff', Math.max(2, Math.round(labelFontSize / 6)));
                wordLabel.setShadow(0, 0, 'rgba(0,0,0,0.35)', 6, true, true);
                container.add(wordImg);
                container.add(wordLabel);
                container.bringToTop(wordLabel);
                this.wordImages.push(wordImg);

                const showLabel = () => {
                    wordLabel.setAlpha(1);
                };

                const hideLabel = () => {
                    wordLabel.setAlpha(0);
                };

                container.on('pointerover', showLabel);
                container.on('pointerout', hideLabel);
                container.on('pointerup', hideLabel);
                container.on('pointerdown', () => {
                    showLabel();
                    this.handleWordClick(wordImg, index);
                });
            }
            
            container.setDepth(10);
            this.wordContainers.push(container);
        });

        this.isProcessingAnswer = false;
    }

    /**
     * Обработка клика на слово
     */
    handleWordClick(wordImg, index) {
        if (this.isProcessingAnswer) {
            return;
        }

        this.isProcessingAnswer = true;

        const isCorrect = index === this.currentWordSet.oddOneOutIndex;

        if (isCorrect) {
            // Правильный ответ - анимация улетания с уменьшением и затуханием
            this.playSuccessAnimation(wordImg);
        } else {
            // Неправильный ответ - анимация тряски
            this.playFailAnimation(wordImg);
        }
    }

    /**
     * Анимация успеха (медленное затухание на месте)
     */
    playSuccessAnimation(wordImg) {
        // Воспроизводим звук успеха
        try {
            if (!soundManager.isMuted && this.sound && this.cache.audio.exists('success')) {
                this.sound.play('success');
            }
        } catch (e) {
            console.warn('Could not play success sound:', e);
        }

        // Находим контейнер
        const container = this.wordContainers.find(c => c.list.includes(wordImg));
        
        // Анимация медленного затухания на месте
        if (container) {
            this.tweens.add({
                targets: [wordImg, container],
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {
                    // Переходим к следующему набору
                    if (this.callbacks && this.callbacks.onNextWord) {
                        this.isProcessingAnswer = false;
                        this.callbacks.onNextWord();
                    }
                }
            });
        } else {
            // Если контейнер не найден, анимируем только картинку
            this.tweens.add({
                targets: wordImg,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {
                    // Переходим к следующему набору
                    if (this.callbacks && this.callbacks.onNextWord) {
                        this.isProcessingAnswer = false;
                        this.callbacks.onNextWord();
                    }
                }
            });
        }
    }

    /**
     * Анимация ошибки (тряска)
     */
    playFailAnimation(wordImg) {
        // Воспроизводим звук ошибки
        try {
            if (!soundManager.isMuted && this.sound && this.cache.audio.exists('fail')) {
                this.sound.play('fail');
            }
        } catch (e) {
            console.warn('Could not play fail sound:', e);
        }

        // Анимация тряски
        const originalX = wordImg.x;
        const originalY = wordImg.y;
        
        this.tweens.add({
            targets: wordImg,
            x: originalX - 10,
            duration: 50,
            yoyo: true,
            repeat: 5,
            ease: 'Power1',
            onComplete: () => {
                wordImg.x = originalX;
                wordImg.y = originalY;
                this.isProcessingAnswer = false;
            }
        });

        // Также трясем контейнер
        const container = this.wordContainers.find(c => c.list.includes(wordImg));
        if (container) {
            const containerOriginalX = container.x;
            const containerOriginalY = container.y;
            
            this.tweens.add({
                targets: container,
                x: containerOriginalX - 10,
                duration: 50,
                yoyo: true,
                repeat: 5,
                ease: 'Power1',
                onComplete: () => {
                    container.x = containerOriginalX;
                    container.y = containerOriginalY;
                }
            });
        }
    }

    /**
     * Обновление слова (следующий набор)
     */
    async updateWord(newWordSet) {
        this.currentWordSet = newWordSet;
        
        // Очищаем старые элементы
        this.wordImages.forEach(img => {
            if (img && img.active) {
                img.destroy();
            }
        });
        this.wordContainers.forEach(container => {
            if (container && container.active) {
                container.destroy();
            }
        });
        this.wordImages = [];
        this.wordContainers = [];

        // Удаляем старые текстуры
        for (let i = 0; i < 4; i++) {
            const wordKey = `word-${i}`;
            if (this.textures.exists(wordKey)) {
                this.textures.remove(wordKey);
            }
        }

        // Загружаем новые картинки
        if (newWordSet && newWordSet.words) {
            newWordSet.words.forEach((word, index) => {
                const wordImagePath = `images/words/${word.img}`;
                const wordKey = `word-${index}`;
                
                const timestamp = Date.now();
                const wordImagePathWithCache = `${wordImagePath}?t=${timestamp}`;
                this.load.image(wordKey, wordImagePathWithCache);
            });
        }

        // Ждем загрузки
        this.load.once('complete', () => {
            this.setupTextureFilters();
            this.createWordGrid(newWordSet);
        });

        this.load.start();
    }

    /**
     * Настройка фильтров текстур для лучшего качества
     */
    setupTextureFilters() {
        // Настройки фильтров текстур уже установлены в PhaserGameManager.js
        // через render.minFilter, render.magFilter в конфигурации игры
        // Дополнительная настройка не требуется, так как Phaser применяет эти настройки автоматически
    }
}

