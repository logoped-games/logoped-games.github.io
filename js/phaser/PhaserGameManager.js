/**
 * Менеджер для управления Phaser играми
 * Интегрирует Phaser с Vue приложением
 */
export class PhaserGameManager {
    constructor() {
        this.game = null;
        this.currentScene = null;
        this.gameConfig = null;
        this.callbacks = {};
    }

    /**
     * Инициализация Phaser игры
     */
    init(containerId = 'phaser-game-container') {
        if (this.game) {
            this.destroy();
        }

        // Создаем контейнер для игры если его нет
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.width = '100%';
            container.style.height = '100%';
            document.body.appendChild(container);
        }

        // Базовые размеры игрового мира
        const BASE_WIDTH = 1280;
        const BASE_HEIGHT = 720;

        const config = {
            type: Phaser.WEBGL, // Явно используем WebGL для лучшего качества
            parent: containerId,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: BASE_WIDTH,
                height: BASE_HEIGHT
            },
            backgroundColor: '#d9eaff',
            pixelArt: false,
            antialias: true,
            antialiasGL: true, // Включаем сглаживание для WebGL контекста
            roundPixels: false,
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false,
                // Используем разрешение равное devicePixelRatio для Retina дисплеев
                resolution: 4,
                // Настройки фильтрации текстур
                mipmapFilter: 'LINEAR',
                minFilter: 'LINEAR',
                magFilter: 'LINEAR',
                // Дополнительные настройки для качества
                transparent: false,
                preserveDrawingBuffer: false
            },
            scene: []
        };

        this.game = new Phaser.Game(config);
        
        // Убираем margin-top у canvas если есть и настраиваем сглаживание
        this.game.events.once('ready', () => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                canvas.style.marginTop = '0px';
                // Настройки для сглаживания
                canvas.style.imageRendering = 'auto';
                canvas.style.imageRendering = '-webkit-optimize-contrast';
                
                // Если используется WebGL, настраиваем контекст
                const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                if (gl) {
                    // Включаем сглаживание для текстур
                    // gl.enable(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }
            }
            
            // Принудительно обновляем размеры после готовности
            this.game.scale.refresh();
        });
        
        // Также обновляем при изменении размера окна
        // Удаляем старый обработчик если он существует
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        this.resizeHandler = () => {
            if (this.game && this.game.scale) {
                this.game.scale.refresh();
            }
        };
        window.addEventListener('resize', this.resizeHandler);
        
        // Также отслеживаем изменения размера контейнера напрямую
        this.resizeObserver = new ResizeObserver(() => {
            if (this.game && this.game.scale) {
                this.game.scale.refresh();
            }
        });
        this.resizeObserver.observe(container);
    }

    /**
     * Запуск игры с переданными данными
     */
    async startGame(gameData, currentWord, currentTargets, currentItemValue, callbacks = {}) {
        if (!this.game) {
            this.init();
        }

        // Останавливаем и удаляем все существующие сцены перед созданием новой
        if (this.currentScene) {
            const oldSceneKey = this.currentScene.scene.key;
            if (this.game.scene.isActive(oldSceneKey)) {
                this.game.scene.stop(oldSceneKey);
            }
            this.game.scene.remove(oldSceneKey);
            this.currentScene = null;
        }
        
        // Удаляем все другие сцены игры для предотвращения накопления
        const sceneManager = this.game.scene;
        const sceneKeys = Object.keys(sceneManager.keys || {});
        sceneKeys.forEach(key => {
            if (sceneManager.isActive(key)) {
                sceneManager.stop(key);
            }
            if (sceneManager.keys[key]) {
                sceneManager.remove(key);
            }
        });

        // Подготавливаем конфиг для игры
        const gameConfig = {
            ...gameData,
            gameType: gameData.currentType, // Тип игры (diff или position)
            currentTargets: currentTargets,
            currentItemValue: currentItemValue,
            layoutConfig: gameData.layoutConfig
        };

        this.gameConfig = gameConfig;
        this.callbacks = callbacks;

        // Создаем сцену
        const sceneKey = `GameScene-${Date.now()}`;
        
        let GameScene;
        
        // Выбираем класс сцены в зависимости от типа игры
        if (gameData.currentType === 'syllables' || gameData.currentType === 'letters') {
            // Используем специальную сцену для игры со слогами
            const SyllablesGameSceneModule = await import('./SyllablesGameScene.js');
            GameScene = class extends SyllablesGameSceneModule.SyllablesGameScene {
                constructor() {
                    super(sceneKey);
                }
            };
        } else if (gameData.currentType === 'odd_one_out' || gameData.currentType === 'odd_one_out_sound') {
            // Используем специальную сцену для игры "Четвертий зайвий" и "Четвертий зайвий звук"
            const OddOneOutGameSceneModule = await import('./OddOneOutGameScene.js');
            GameScene = class extends OddOneOutGameSceneModule.OddOneOutGameScene {
                constructor() {
                    super(sceneKey);
                }
            };
        } else {
            // Используем базовую сцену для других типов игр
            const BaseGameScene = (await import('./BaseGameScene.js')).BaseGameScene;
            GameScene = class extends BaseGameScene {
                constructor() {
                    super(sceneKey);
                }
            };
        }

        // Регистрируем сцену
        this.game.scene.add(sceneKey, GameScene);
        
        // Запускаем сцену с данными
        // Важно: currentTargets должны быть в gameConfig до вызова preload
        this.game.scene.start(sceneKey, {
            gameConfig: gameConfig,
            currentWord: currentWord,
            callbacks: callbacks
        });

        this.currentScene = this.game.scene.getScene(sceneKey);
    }

    /**
     * Остановка текущей игры
     */
    stopGame() {
        if (!this.game) {
            return;
        }
        
        // Останавливаем все активные сцены
        if (this.currentScene) {
            const sceneKey = this.currentScene.scene.key;
            if (this.game.scene.isActive(sceneKey)) {
                this.game.scene.stop(sceneKey);
            }
            if (this.game.scene.keys[sceneKey]) {
                this.game.scene.remove(sceneKey);
            }
            this.currentScene = null;
        }
        
        // Удаляем все сцены из игры
        const sceneManager = this.game.scene;
        const sceneKeys = Object.keys(sceneManager.keys);
        sceneKeys.forEach(key => {
            if (sceneManager.isActive(key)) {
                sceneManager.stop(key);
            }
            if (sceneManager.keys[key]) {
                sceneManager.remove(key);
            }
        });
    }

    /**
     * Обновление данных игры (следующее слово)
     */
    async updateGameData(currentWord, currentTargets, currentItemValue) {
        if (!this.currentScene || !this.gameConfig) {
            return;
        }

        // Обновляем конфиг
        this.gameConfig.currentTargets = currentTargets;
        this.gameConfig.currentItemValue = currentItemValue;
        this.gameConfig.currentWord = currentWord;

        // Обновляем сцену напрямую без пересоздания
        if (this.currentScene.updateWord) {
            await this.currentScene.updateWord(currentWord);
        } else {
            // Fallback: если метод не существует, пересоздаем сцену
            const oldSceneKey = this.currentScene.scene.key;
            this.game.scene.stop(oldSceneKey);
            this.game.scene.remove(oldSceneKey);

            // Создаем новую сцену с обновленными данными
            const sceneKey = `GameScene-${Date.now()}`;
            const BaseGameScene = (await import('./BaseGameScene.js')).BaseGameScene;
            
            class GameScene extends BaseGameScene {
                constructor() {
                    super(sceneKey);
                }
            }

            // Регистрируем новую сцену
            this.game.scene.add(sceneKey, GameScene);
            
            // Запускаем с обновленными данными
            this.game.scene.start(sceneKey, {
                gameConfig: this.gameConfig,
                currentWord: currentWord,
                callbacks: this.callbacks
            });

            this.currentScene = this.game.scene.getScene(sceneKey);
        }
    }

    /**
     * Уничтожение игры
     */
    destroy() {
        // Останавливаем игру перед уничтожением
        this.stopGame();
        
        // Удаляем обработчик resize
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        // Отключаем observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        // Очищаем контейнер перед уничтожением игры
        if (this.game && this.game.canvas) {
            const container = this.game.canvas.parentElement;
            if (container) {
                // Очищаем содержимое контейнера
                container.innerHTML = '';
            }
        }
        
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
        }
        
        // Очищаем ссылки
        this.currentScene = null;
        this.gameConfig = null;
        this.callbacks = {};
    }
}

