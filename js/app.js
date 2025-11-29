const {createApp, ref, shallowRef, reactive, computed, onMounted, nextTick, markRaw} = Vue;
import {config} from './config.js';
import {itemAnimations} from "./animations.js";
import {gameUtils} from "./utils.js";
import {PhaserGameManager} from './phaser/PhaserGameManager.js';

// Games data - loaded from external file
const gamesData = {
    GAMES: window.GAMES || []
};

// Words data - loaded from external file
const wordsData = {
    WORDS: window.WORDS || []
};

// Track used words across different game types to avoid duplicates on the same screen
const usedWordsTracker = {
    odd_one_out: new Set(), // Words used in "четвертый лишний"
    odd_one_out_sound: new Set(), // Words used in "четвертый лишний звук"
    
    // Add words from a word set
    addWords: function(gameType, wordSet) {
        if (wordSet && wordSet.words) {
            const words = wordSet.words.map(w => w.word || w);
            words.forEach(word => {
                if (gameType === 'odd_one_out') {
                    this.odd_one_out.add(word);
                } else if (gameType === 'odd_one_out_sound') {
                    this.odd_one_out_sound.add(word);
                }
            });
        }
    },
    
    // Check if a word is used in the other game type
    isWordUsedInOtherType: function(gameType, word) {
        if (gameType === 'odd_one_out') {
            return this.odd_one_out_sound.has(word);
        } else if (gameType === 'odd_one_out_sound') {
            return this.odd_one_out.has(word);
        }
        return false;
    },
    
    // Clear all tracked words
    clear: function() {
        this.odd_one_out.clear();
        this.odd_one_out_sound.clear();
    },
    
    // Clear words for a specific game type
    clearType: function(gameType) {
        if (gameType === 'odd_one_out') {
            this.odd_one_out.clear();
        } else if (gameType === 'odd_one_out_sound') {
            this.odd_one_out_sound.clear();
        }
    }
};

// Images data - will be loaded dynamically
let imagesData = {};

// Load images data
async function loadImagesData() {
    try {
        // Try different possible paths
        const paths = ['js/images.json', '/js/images.json', './js/images.json'];
        let loaded = false;
        
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    imagesData = await response.json();
                    loaded = true;
                    break;
                }
            } catch (e) {
                // Try next path
                continue;
            }
        }
        
        if (!loaded) {
            console.warn('Could not load images.json from any path. Target positioning may use fallback sizes.');
        }
    } catch (error) {
        console.error('Failed to load images.json:', error);
    }
}

// Load images data immediately
loadImagesData();

// Function to position targets dynamically
function positionTargets() {
    const gameContainer = document.querySelector('.game-container');
    const targetsContainer = document.querySelector('.targets-container');
    const gameBackground = document.querySelector('.game-background');
    const targets = document.querySelectorAll('.target');
    
    if (!gameContainer || !targetsContainer || !gameBackground || targets.length === 0) {
        return;
    }
    
    // Wait for background image to load
    if (!gameBackground.complete || gameBackground.naturalWidth === 0) {
        gameBackground.addEventListener('load', positionTargets, { once: true });
        return;
    }
    
    // Get background dimensions
    const bgRect = gameBackground.getBoundingClientRect();
    const bgWidth = bgRect.width;
    const bgHeight = bgRect.height;
    
    if (bgWidth === 0 || bgHeight === 0) {
        return;
    }
    
    // Get current game data from Vue
    const gameContainerData = gameContainer.getAttribute('data-game-name');
    const gameType = gameContainer.getAttribute('data-game-type');
    
    if (!gameContainerData || !gameType) {
        return;
    }
    
    // Find current game
    const currentGame = gamesData.GAMES.find(g => g.gameName === gameContainerData);
    if (!currentGame) {
        return;
    }
    
    // Get background image dimensions from images.json
    const bgPath = currentGame.background;
    const bgImageData = imagesData[bgPath];
    
    // Number of targets
    const targetsCount = targets.length;
    
    // Get target images data and calculate sizes
    const targetSizes = [];
    let totalTargetWidth = 0;
    const isMobile = bgWidth < 768;

    targets.forEach((target, index) => {
        const targetImg = target.querySelector('.target-img');
        if (!targetImg) return;
        
        const imgSrc = targetImg.getAttribute('src');
        const targetImageData = imagesData[imgSrc];

        if (targetImageData) {
            // Use actual displayed image dimensions if available
            let targetImageWidth = targetImageData.width;
            let targetImageHeight = targetImageData.height;
            
            // Calculate target size based on container
            // Use bottom 40% of background for targets area on desktop, 35% on mobile
            const targetsAreaHeight = isMobile ? bgHeight * 0.4 : bgHeight * 0.40;
            const maxTargetHeight = targetsAreaHeight * 1.8; // 90% of targets area
            
            // Calculate target width maintaining aspect ratio
            const targetImageAspect = targetImageWidth / targetImageHeight;
            let targetWidth = maxTargetHeight * targetImageAspect;
            
            // If we have background image data, use it for better scaling
            if (bgImageData) {
                const bgImageAspect = bgImageData.width / bgImageData.height;
                const bgDisplayedAspect = bgWidth / bgHeight;
                const scaleX = bgWidth / bgImageData.width;
                const scaleY = bgHeight / bgImageData.height;
                const scale = Math.min(scaleX, scaleY);
                
                // Adjust target size based on background scale
                targetWidth = maxTargetHeight * targetImageAspect * scale;
            }
            
            targetSizes.push({
                width: targetWidth,
                height: maxTargetHeight,
                element: target
            });
            
            totalTargetWidth += targetWidth;
        } else {
            // Fallback: use default sizing if image data not available
            const defaultHeight = isMobile ? bgHeight * 0.35 : bgHeight * 0.35;
            const defaultWidth = defaultHeight * 1.2; // Assume 1.2:1 aspect ratio
            
            targetSizes.push({
                width: defaultWidth,
                height: defaultHeight,
                element: target
            });
            
            totalTargetWidth += defaultWidth;
        }
    });
    
    // Calculate spacing between targets
    const availableWidth = bgWidth * 1; // 90% of background width for targets area
    const minSpacing = isMobile ? 20 : 30;
    
    let spacing;
    if (targetsCount > 1) {
        const calculatedSpacing = (availableWidth - totalTargetWidth) / (targetsCount + 1);
        spacing = Math.max(calculatedSpacing, minSpacing);
    } else {
        spacing = (availableWidth - totalTargetWidth) / 2;
    }
    
    // Position targets
    let currentX = spacing;
    
    targetSizes.forEach((targetSize, index) => {
        const target = targetSize.element;
        
        // Set target size
        target.style.width = targetSize.width + 'px';
        target.style.height = targetSize.height + 'px';
        
        // Position horizontally
        target.style.left = currentX + 'px';
        target.style.bottom = '0';
        
        // Update image size
        const targetImg = target.querySelector('.target-img');
        if (targetImg) {
            targetImg.style.width = '100%';
            targetImg.style.height = '100%';
            targetImg.style.objectFit = 'contain';
        }
        
        // Update label font size responsively
        const targetLabel = target.querySelector('.target-label');
        if (targetLabel) {
            // Responsive font size: increased to 3-5% of background width, clamped between 14-60px
            const baseFontSize = bgWidth * (isMobile ? 0.035 : 0.045);
            const fontSize = Math.min(Math.max(baseFontSize, 14), isMobile ? 40 : 60);
            targetLabel.style.fontSize = fontSize + 'px';
            
            // Adjust padding
            const padding = Math.max(fontSize * 0.4, 4);
            targetLabel.style.padding = `0 ${padding}px`;
        }
        
        currentX += targetSize.width + spacing;
    });
}

// Debounced resize handler
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        positionTargets();
    }, 100);
}

// Main Vue App
const App = {
    setup() {
        // Initialize managers

        // Reactive state
        const currentState = reactive({
            type: null,
            mode: null,
            targetConfig: null,
            game: null,
            currentGameIndex: null,
            isProgress: false,
            allowedWords: [],
            selectedTag: null
        });

        const showNav = ref(false);
        const showGameTypeSelect = ref(true);
        const showGameLettersSelect = ref(false);
        const showGameTagSelect = ref(false);
        const showGameSelect = ref(false);
        const showGameContainer = ref(false);
        const showGameFinished = ref(false);
        const gameHeader = ref('');
        const customBlock = ref('');
        const phaserGameManager = shallowRef(null);

        // Computed properties
        const currentGame = computed(() => {
            return currentState.currentGameIndex !== null ? gamesData.GAMES[currentState.currentGameIndex] : null;
        });

        const currentWord = computed(() => {
            const word = currentState.allowedWords && currentState.allowedWords.length > 0
                ? currentState.allowedWords[0]
                : null;
            console.log('currentWord computed:', word ? word.word : 'null');
            return word;
        });

        const currentTargets = computed(() => {
            console.log('currentTargets');
            if (!currentGame.value || !currentState.targetConfig) {
                return [];
            }

            const gameData = currentGame.value;
            const targetConfigs = gameData.targetConfigs[currentState.type];

            return targetConfigs.map((targetConfig, index) => ({
                ...targetConfig,
                value: currentState.targetConfig.targets[index].value,
                label: currentState.targetConfig.targets[index].label
            }));
        });

        const filteredGames = computed(() => {
            if (!currentState.type) {
                return [];
            }
            return gamesData.GAMES.filter(game => {
                return game && game.thumbnails && game.thumbnails[currentState.type];
            });
        });

        // Methods
        const resetState = () => {
            currentState.type = null;
            currentState.mode = null;
            currentState.targetConfig = null;
            currentState.game = null;
            currentState.currentGameIndex = null;
            currentState.isProgress = false;
            currentState.allowedWords = [];
            currentState.selectedTag = null;
            // Очищаем трекер использованных слов при сбросе состояния
            usedWordsTracker.clear();
        };

        const renderGameTypeSelect = () => {
            showGameTypeSelect.value = true;
            showGameLettersSelect.value = false;
            showGameTagSelect.value = false;
            showGameSelect.value = false;
            showGameContainer.value = false;
            showGameFinished.value = false;
        };

        const renderGameLetterSelect = () => {
            showGameTypeSelect.value = false;
            showGameLettersSelect.value = true;
            showGameTagSelect.value = false;
            showGameSelect.value = false;
            showGameContainer.value = false;
        };

        const renderGameTagSelect = () => {
            showGameTypeSelect.value = false;
            showGameLettersSelect.value = false;
            showGameTagSelect.value = true;
            showGameSelect.value = false;
            showGameContainer.value = false;
        };

        const renderGameList = () => {
            showGameTypeSelect.value = false;
            showGameLettersSelect.value = false;
            showGameTagSelect.value = false;
            showGameSelect.value = true;
            showGameContainer.value = false;
        };

        const onSelectGameType = (type) => {
            currentState.type = type;
            // Для игры "Четвертий зайвий" пропускаем выбор букв и тегов
            if (type === config.TYPE_ODD_ONE_OUT) {
                renderGameList();
            } else if (type === config.TYPE_ODD_ONE_OUT_SOUND) {
                // Для "Четвертий зайвий звук" показываем выбор звуков (как в diff)
                renderGameLetterSelect();
            } else {
                renderGameLetterSelect();
            }
            window.scrollTo(0, 0);
            checkMainLink();
        };

        const onSelectGameLetters = (targetsIndex) => {
            currentState.targetConfig = config.ALLOWED_LETTERS[currentState.type][targetsIndex];
            currentState.selectedTag = null;
            // Для "Четвертий зайвий звук" показываем выбор тегов
            if (currentState.type === config.TYPE_ODD_ONE_OUT_SOUND) {
                renderGameTagSelect();
            } else if (currentState.type === config.TYPE_ODD_ONE_OUT) {
                // Для обычного "Четвертий зайвий" пропускаем выбор тегов
                renderGameList();
            } else {
                renderGameTagSelect();
            }
            window.scrollTo(0, 0);
            checkMainLink();
        };

        const onSelectGame = async (gameIndex) => {
            currentState.allowedWords = [];
            currentState.isProgress = true;

            showGameSelect.value = false;
            showGameFinished.value = false;

            currentState.currentGameIndex = gameIndex;
            const gameData = gamesData.GAMES[currentState.currentGameIndex];

            showGameContainer.value = true;
            showNav.value = false; // Скрываем навигацию во время игры
            gameHeader.value = getGameHeader();
            customBlock.value = gameData.customBlock || '';

            currentState.allowedWords = getAllowedWords();

            window.scrollTo(0, 0);
            await initPhaserGame();
            
            checkMainLink();
        };

        const initPhaserGame = async () => {
            // Ждем пока контейнер отрендерится в DOM
            await nextTick();
            
            // Проверяем что контейнер существует
            const container = document.getElementById('phaser-game-container');
            if (!container) {
                console.error('Phaser container not found');
                return;
            }
            
            // Ждем пока контейнер получит размеры
            await new Promise(resolve => {
                if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                    resolve();
                } else {
                    // Используем ResizeObserver или проверяем периодически
                    const checkSize = () => {
                        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                            resolve();
                        } else {
                            requestAnimationFrame(checkSize);
                        }
                    };
                    requestAnimationFrame(checkSize);
                }
            });
            
            // Уничтожаем предыдущую игру если она существует
            if (phaserGameManager.value) {
                phaserGameManager.value.destroy();
                phaserGameManager.value = null;
            }
            
            // Создаем новый менеджер и защищаем от Vue reactivity
            const manager = new PhaserGameManager();
            phaserGameManager.value = markRaw(manager);
            manager.init('phaser-game-container');
            
            // Небольшая задержка для полной инициализации Phaser
            await new Promise(resolve => setTimeout(resolve, 100));

            const gameData = gamesData.GAMES[currentState.currentGameIndex];
            const currentWord = currentState.allowedWords[0];
            
            if (!currentWord) {
                showGameFinished.value = true;
                currentState.isProgress = false;
                return;
            }

            // Для новой игры передаем весь набор слов, для остальных - текущее слово
            const currentItemValue = (currentState.type === config.TYPE_ODD_ONE_OUT || currentState.type === config.TYPE_ODD_ONE_OUT_SOUND)
                ? null 
                : gameUtils.getCurrentItemValue(currentWord, currentState);
            
            // Подготовка данных игры для Phaser
            const phaserGameData = {
                ...gameData,
                currentType: currentState.type,
                layoutConfig: gameData.layoutConfig || null,
                gameHeader: gameHeader.value,
                targetConfig: currentState.targetConfig
            };

            // Используем уже созданный менеджер
            await manager.startGame(
                phaserGameData,
                currentWord,
                currentTargets.value,
                currentItemValue,
                {
                    onNextWord: () => {
                        renderNextWord();
                    },
                    onMainClick: onMainClick
                }
            );
            
            // Принудительно вызываем resize после создания игры
            if (manager.game) {
                manager.game.scale.refresh();
            }
        };

        const onTargetClick = async (targetValue, event) => {
            if (!currentState.isProgress) {
                return;
            }

            const gameData = gamesData.GAMES[currentState.currentGameIndex];
            const animation = itemAnimations[gameData.animationType];
            const itemValue = gameUtils.getCurrentItemValue(currentState.allowedWords[0], currentState);

            const targetElement = $(event.target).closest('.target').get(0);

            console.log('Target clicked:', targetValue, 'Item value:', itemValue);
            console.log('Game data:', gameData);
            console.log('Animation type:', gameData.animationType);
            console.log('Animation:', animation);

            if (targetValue === itemValue) {
                console.log('Success! Calling animation.onSuccess');
                await animation.onSuccess(targetElement, gameData, currentState, renderNextWord, positionTargets);
            } else {
                console.log('Fail! Calling animation.onFail');
                await animation.onFail(targetElement, gameData);
            }
        };

        // Get words filtered by current configuration (without tag filter, for tag selection)
        const getFilteredWordsForTagSelection = () => {
            let result = [];

            wordsData.WORDS.forEach((word) => {
                // For syllables game type, check if word has syllables
                if (currentState.type === config.TYPE_SYLLABLES) {
                    if (!word.syllables || word.syllables.length < 2) {
                        return
                    }
                } else if (currentState.type === config.TYPE_LETTERS) {
                    if (!word.word) {
                        return;
                    }
                    const lettersCount = (word.word.match(/\p{L}/gu) || []).length;
                    if (lettersCount < 2) {
                        return;
                    }
                }

                // For "Odd One Out Sound" game, we need words with exactly one of the two sounds
                if (currentState.type === config.TYPE_ODD_ONE_OUT_SOUND) {
                    const wordLetters = _.map(word.letters, 'letter');
                    const sound1 = currentState.targetConfig.letters[0];
                    const sound2 = currentState.targetConfig.letters[1];
                    const hasSound1 = wordLetters.includes(sound1);
                    const hasSound2 = wordLetters.includes(sound2);
                    
                    // Skip words that have BOTH sounds or NEITHER sound
                    if ((hasSound1 && hasSound2) || (!hasSound1 && !hasSound2)) {
                        return;
                    }
                    
                    result.push({
                        letter: hasSound1 ? sound1 : sound2,
                        word: word.word,
                        img: word.img,
                        position: null,
                        syllables: word.syllables || [],
                        tags: word.tags || []
                    });
                    return;
                }

                const intersect = _.intersection(
                    currentState.targetConfig.letters,
                    _.map(word.letters, 'letter')
                );

                if (intersect.length !== 1) {
                    return;
                }

                const position = _.find(word.letters, ['letter', intersect[0]]).position;

                if (currentState.type === config.TYPE_POSITION && position === config.POSITION_UNKNOWN) {
                    return;
                }

                result.push({
                    letter: intersect[0],
                    word: word.word,
                    img: word.img,
                    position: position,
                    syllables: word.syllables || [],
                    tags: word.tags || []
                });
            });

            return result;
        };

        // Compute available tags with counts
        const formatTagDisplayName = (tag) => {
            if (!tag || typeof tag !== 'string') {
                return '';
            }
            return tag.replace(/\p{L}+/gu, (word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            });
        };

        const availableTags = computed(() => {
            if (!currentState.type || !currentState.targetConfig) {
                return {
                    allCount: 0,
                    tags: []
                };
            }

            const filteredWords = getFilteredWordsForTagSelection();
            const allCount = filteredWords.length;
            
            // Count tags
            const tagCounts = {};
            filteredWords.forEach(word => {
                if (word.tags && Array.isArray(word.tags)) {
                    word.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });

            // Filter tags that appear in more than 2 words and create array with counts
            // For "odd_one_out_sound" game, only show tags with more than 10 words
            const minTagCount = currentState.type === config.TYPE_ODD_ONE_OUT_SOUND ? 10 : 5;
            const tags = Object.keys(tagCounts)
                .filter(tag => tagCounts[tag] > minTagCount)
                .map(tag => ({
                    name: tag,
                    displayName: formatTagDisplayName(tag),
                    count: tagCounts[tag]
                }))
                .sort((a, b) => a.name.localeCompare(b.name, 'uk')); // Sort alphabetically

            return {
                allCount: allCount,
                tags: tags
            };
        });

        const getAllowedWords = () => {
            // Для игры "Четвертий зайвий" используем специальную генерацию
            if (currentState.type === config.TYPE_ODD_ONE_OUT) {
                const wordSets = gameUtils.generateOddOneOutWordSets(wordsData, usedWordsTracker);
                // Отслеживаем слова из сгенерированных наборов
                wordSets.forEach(wordSet => {
                    usedWordsTracker.addWords('odd_one_out', wordSet);
                });
                return wordSets;
            }
            // Для игры "Четвертий зайвий звук" используем генерацию по звукам
            if (currentState.type === config.TYPE_ODD_ONE_OUT_SOUND) {
                const wordSets = gameUtils.generateOddOneOutSoundWordSets(wordsData, currentState.targetConfig, currentState.selectedTag, usedWordsTracker);
                // Отслеживаем слова из сгенерированных наборов
                wordSets.forEach(wordSet => {
                    usedWordsTracker.addWords('odd_one_out_sound', wordSet);
                });
                return wordSets;
            }
            return gameUtils.getAllowedWords(wordsData, currentState);
        };

        const onSelectTag = (tag) => {
            currentState.selectedTag = tag === 'all' ? null : tag;
            renderGameList();
            window.scrollTo(0, 0);
            checkMainLink();
        };

        const getCurrentItemValue = () => {
            return gameUtils.getCurrentItemValue(currentWord.value, currentState);
        };

        const getCurrentWordImage = () => {
            return gameUtils.getCurrentWordImage(currentWord.value);
        };

        const getItemBackground = () => {
            return gameUtils.getItemBackground(currentGame.value);
        };

        const renderNextWord = async () => {
            console.log('renderNextWord called, words left:', currentState.allowedWords.length);

            // Remove the first word using immutable approach
            currentState.allowedWords = currentState.allowedWords.slice(1);
            console.log('After slice, words left:', currentState.allowedWords.length);

            if (currentState.allowedWords.length === 0) {
                showGameFinished.value = true;
                currentState.isProgress = false;
                if (phaserGameManager.value) {
                    phaserGameManager.value.destroy();
                    phaserGameManager.value = null;
                }
                return;
            }

            const currentWord = currentState.allowedWords[0];
            if (currentWord && phaserGameManager.value) {
                // Для игр "Четвертий зайвий" передаем null, для остальных - вычисляем значение
                const currentItemValue = (currentState.type === config.TYPE_ODD_ONE_OUT || currentState.type === config.TYPE_ODD_ONE_OUT_SOUND)
                    ? null 
                    : gameUtils.getCurrentItemValue(currentWord, currentState);
                await phaserGameManager.value.updateGameData(
                    currentWord,
                    currentTargets.value,
                    currentItemValue
                );
            }
        };

        const onMainClick = () => {
            // Уничтожаем Phaser игру если есть
            if (phaserGameManager.value) {
                phaserGameManager.value.destroy();
                phaserGameManager.value = null;
            }
            
            resetState();
            showGameContainer.value = false;
            showGameFinished.value = false;
            renderGameTypeSelect();
            window.scrollTo(0, 0);
            checkMainLink();
        };

        const checkMainLink = () => {
            showNav.value = !showGameTypeSelect.value;
        };

        const getGameHeader = () => {
            if (currentState.type === config.TYPE_ODD_ONE_OUT) {
                return 'Четвертий зайвий';
            }
            if (currentState.type === config.TYPE_ODD_ONE_OUT_SOUND) {
                return 'Четвертий зайвий звук ' + currentState.targetConfig?.label;
            }
            return gameUtils.getGameHeader(currentState);
        };

        // Initialize app
        onMounted(() => {
            resetState();
            renderGameTypeSelect();
            checkMainLink();
            
            // Setup resize handler
            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    positionTargets();
                }, 300);
            });
            
            // Watch for game container visibility to reposition targets and manage body class
            const unwatchGameContainer = Vue.watch(showGameContainer, (newVal) => {
                // Управляем классом game-active для блокировки скролла
                if (newVal) {
                    document.body.classList.add('game-active');
                    nextTick(() => {
                        setTimeout(() => {
                            positionTargets();
                        }, 100);
                    });
                } else {
                    document.body.classList.remove('game-active');
                }
            });
            
            // Watch for targets changes
            const unwatchTargets = Vue.watch(currentTargets, () => {
                nextTick(() => {
                    setTimeout(() => {
                        positionTargets();
                    }, 100);
                });
            }, { deep: true });
        });

        return {
            // State
            currentState,
            showNav,
            showGameTypeSelect,
            showGameLettersSelect,
            showGameTagSelect,
            showGameSelect,
            showGameContainer,
            showGameFinished,
            gameHeader,
            customBlock,
            currentGame,
            currentWord,
            currentTargets,
            availableTags,
            filteredGames,
            // usePhaser,

            // Data
            allowedTypes: config.ALLOWED_TYPES,
            allowedLetters: config.ALLOWED_LETTERS,
            games: gamesData.GAMES,

            // Methods
            onSelectGameType,
            onSelectGameLetters,
            onSelectTag,
            onSelectGame,
            onTargetClick,
            onMainClick,
            getCurrentItemValue,
            getCurrentWordImage,
            getItemBackground
        };
    },
    template: `
        <div class="container">
            <!-- Navigation -->
            <div class="nav" :style="showNav ? { } : {  visibility: 'hidden' }">
                <div class="button main-link" @click="onMainClick">
                    <span>На головну</span>
                </div>
            </div>

            <!-- Game Type Selection -->
            <div class="game-type-select-container menu-container" v-show="showGameTypeSelect">
                <div 
                    v-for="(type, index) in allowedTypes" 
                    :key="index"
                    class="button game-type" 
                    @click="onSelectGameType(type.type)"
                >
                    <span>{{ type.label }}</span>
                </div>
            </div>

            <!-- Game Letters Selection -->
            <div class="game-letters-select-container menu-container" v-show="showGameLettersSelect">
                <div 
                    v-for="(item, index) in allowedLetters[currentState.type]" 
                    :key="index"
                    class="button game-letters" 
                    @click="onSelectGameLetters(index)"
                >
                    <span>{{ item.label }}</span>
                </div>
            </div>

            <!-- Game Tag Selection -->
            <div class="game-tag-select-container menu-container" v-show="showGameTagSelect">
                <div 
                    class="button game-tag" 
                    @click="onSelectTag('all')"
                >
                    <span>Всі категорії ({{ availableTags.allCount }})</span>
                </div>
                <div 
                    v-for="(tag, index) in availableTags.tags" 
                    :key="index"
                    class="button game-tag" 
                    @click="onSelectTag(tag.name)"
                >
                    <span>{{ tag.displayName }} ({{ tag.count }})</span>
                </div>
            </div>

            <!-- Game Selection -->
            <div class="game-select-container menu-container" v-show="showGameSelect">
                <div 
                    v-for="(gameData, index) in filteredGames" 
                    :key="gameData.gameName || index"
                    class="game" 
                    @click="onSelectGame(games.findIndex(g => g.gameName === gameData.gameName))"
                >
                    <img :src="gameData.thumbnails[currentState.type]" class="game-preview">
                </div>
            </div>

            <!-- Game Container -->
            <div class="game-container" v-show="showGameContainer" :data-game-name="currentGame?.gameName" :data-game-type="currentState.type">
                <!-- Game Finished -->
                <div class="game-finished" v-show="showGameFinished">
                    <h1>Гру завершено</h1>
                    <div class="button main-link" @click="onMainClick">
                        <span>На головну</span>
                    </div>
                </div>

                <!-- Custom Block -->
                <div class="custom-block" v-html="customBlock"></div>

                <!-- Phaser Game Container -->
                <div id="phaser-game-container" v-show="!showGameFinished" style="width: 100%; height: 100vh; position: relative;"></div>
            </div>
        </div>

        <div class="footer">&copy; Зінченко Олена 2021</div>
    `
};

// Create and mount the app
const app = createApp(App);
app.mount('#app');

// Prevent pinch zoom on mobile devices
(function() {
    let lastTouchEnd = 0;
    
    // Prevent double-tap zoom
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // Prevent pinch zoom (two-finger gestures)
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    // Prevent gesture zoom on iOS Safari
    document.addEventListener('gesturestart', function(event) {
        event.preventDefault();
    });
    
    document.addEventListener('gesturechange', function(event) {
        event.preventDefault();
    });
    
    document.addEventListener('gestureend', function(event) {
        event.preventDefault();
    });
})();