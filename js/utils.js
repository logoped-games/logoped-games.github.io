import {config} from './config.js';

// Utility functions for the game
export const gameUtils = {
    // Get allowed words based on current configuration
    getAllowedWords: (wordsData, currentState) => {
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

            // Filter by selected tag if any
            if (currentState.selectedTag !== null) {
                const wordTags = word.tags || [];
                if (!wordTags.includes(currentState.selectedTag)) {
                    return;
                }
            }

            result.push({
                letter: intersect[0],
                word: word.word,
                img: word.img,
                position: position,
                syllables: word.syllables || [],
            });
        });

        return _.shuffle(result);
    },

    // Get current item value based on game type
    getCurrentItemValue: (currentWord, currentState) => {
        if (!currentWord) {
            return null;
        }
        if (currentState.type === config.TYPE_DIFF) {
            return currentWord.letter;
        } else if (currentState.type === config.TYPE_SYLLABLES) {
            return currentWord.syllables || [];
        } else if (currentState.type === config.TYPE_LETTERS) {
            return currentWord.word || '';
        }
        return currentWord.position;
    },

    // Get current word image path
    getCurrentWordImage: (currentWord) => {
        if (!currentWord) {
            return '';
        }
        return config.WORDS_DIR + '/' + currentWord.img;
    },

    // Get random item background
    getItemBackground: (currentGame) => {
        if (!currentGame || !currentGame.wordConfig?.backgrounds) {
            return null;
        }
        const backgrounds = currentGame.wordConfig.backgrounds;
        return backgrounds[Math.floor(Math.random() * backgrounds.length)];
    },

    // Get game header text
    getGameHeader: (currentState) => {
        if (currentState.type === config.TYPE_DIFF) {
            return 'Диференціація ' + currentState.targetConfig?.label;
        } else if (currentState.type === config.TYPE_SYLLABLES) {
            return 'Збери слово';
        } else if (currentState.type === config.TYPE_LETTERS) {
            return 'Збери слово по буквам';
        }
        return 'Визначення місця звука ' + currentState.targetConfig?.label;
    },

    // Animation utility function
    animateCSS: ($element, animationName, callback) => {
        const node = ($element instanceof jQuery) ? $element.get(0) : $element;
        node.classList.add('animate__animated', `animate__${animationName}`);

        function handleAnimationEnd() {
            node.classList.remove('animate__animated', `animate__${animationName}`);
            node.removeEventListener('animationend', handleAnimationEnd);

            if (typeof callback === 'function') {
                callback();
            }
        }

        node.addEventListener('animationend', handleAnimationEnd);
    },

    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Generate word sets for "Odd One Out" game
    generateOddOneOutWordSets: (wordsData, usedWordsTracker = null) => {
        const relatedClusters = config.ODD_ONE_OUT_RELATED_CLUSTERS;
        const setsPerCategory = config.ODD_ONE_OUT_SETS_PER_CATEGORY;
        
        // Final list of word sets
        const finalWordSets = [];
        
        // Process each cluster
        relatedClusters.forEach((cluster) => {
            // Process each category in the cluster
            cluster.forEach((categoryTag) => {
                // Words that have the category tag (but may have other tags, just not from this cluster)
                const categoryWords = [];
                // Words that don't have ANY tag from this cluster
                const nonClusterWords = [];
                
                wordsData.WORDS.forEach((word) => {
                    const wordTags = word.tags || [];
                    
                    // Skip words that are already used in the other game type
                    if (usedWordsTracker && usedWordsTracker.isWordUsedInOtherType('odd_one_out', word.word)) {
                        return;
                    }
                    
                    // Check if word has any tag from the cluster
                    const hasClusterTag = cluster.some(tag => wordTags.includes(tag));
                    
                    // Check if word has the specific category tag
                    const hasCategoryTag = wordTags.includes(categoryTag);
                    
                    if (hasCategoryTag) {
                        // Word has the category tag - it can be used as one of the 3 main words
                        // (it may have other tags from the cluster, which is fine)
                        categoryWords.push({
                            word: word.word,
                            img: word.img,
                            tags: wordTags
                        });
                    } else if (!hasClusterTag) {
                        // Word doesn't have any tag from the cluster - it can be the odd one out
                        nonClusterWords.push({
                            word: word.word,
                            img: word.img,
                            tags: wordTags
                        });
                    }
                });
                
                // Shuffle both lists
                const shuffledCategory = _.shuffle([...categoryWords]);
                const shuffledNonCluster = _.shuffle([...nonClusterWords]);
                
                // Create copies for round-robin usage
                let categoryList = [...shuffledCategory];
                let nonClusterList = [...shuffledNonCluster];
                let categoryIndex = 0;
                let nonClusterIndex = 0;
                
                // Generate sets for this category
                const categorySets = [];
                
                for (let i = 0; i < setsPerCategory; i++) {
                    // Get 3 unique words from category tag
                    const mainWords = [];
                    const usedMainWords = new Set(); // Track used words to avoid duplicates
                    let attempts = 0;
                    const maxAttempts = categoryList.length * 3; // Prevent infinite loop
                    
                    while (mainWords.length < 3 && attempts < maxAttempts) {
                        attempts++;
                        if (categoryIndex >= categoryList.length) {
                            // Reset and reshuffle
                            categoryList = _.shuffle([...shuffledCategory]);
                            categoryIndex = 0;
                        }
                        const candidateWord = categoryList[categoryIndex];
                        const wordKey = candidateWord.word;
                        
                        // Check if word is already in the set
                        if (!usedMainWords.has(wordKey)) {
                            mainWords.push(candidateWord);
                            usedMainWords.add(wordKey);
                        }
                        categoryIndex++;
                    }
                    
                    // If we couldn't get 3 unique words, skip this set
                    if (mainWords.length < 3) {
                        continue;
                    }
                    
                    // Get 1 word that doesn't have any tag from the cluster (must be different from main words)
                    const usedAllWords = new Set(mainWords.map(w => w.word));
                    let oddOneOutWord = null;
                    attempts = 0;
                    const maxOddAttempts = nonClusterList.length * 2;
                    
                    while (!oddOneOutWord && attempts < maxOddAttempts) {
                        attempts++;
                        if (nonClusterIndex >= nonClusterList.length) {
                            // Reset and reshuffle
                            nonClusterList = _.shuffle([...shuffledNonCluster]);
                            nonClusterIndex = 0;
                        }
                        const candidateWord = nonClusterList[nonClusterIndex];
                        const wordKey = candidateWord.word;
                        
                        // Check if word is different from main words
                        if (!usedAllWords.has(wordKey)) {
                            oddOneOutWord = candidateWord;
                        }
                        nonClusterIndex++;
                    }
                    
                    // If we couldn't get a unique odd one out word, skip this set
                    if (!oddOneOutWord) {
                        continue;
                    }
                    
                    // Combine and shuffle the 4 words
                    const allWords = [...mainWords, oddOneOutWord];
                    const shuffledSet = _.shuffle(allWords);
                    
                    // Store which word is the odd one out (index in shuffled array)
                    const oddOneOutIndex = shuffledSet.findIndex(w => w === oddOneOutWord);
                    
                    categorySets.push({
                        words: shuffledSet,
                        oddOneOutIndex: oddOneOutIndex,
                        mainTag: categoryTag,
                        cluster: cluster
                    });
                }
                
                // Add sets to final list
                finalWordSets.push(...categorySets);
            });
        });
        
        // Merge sets so they alternate between categories
        // Group sets by category
        const setsByCategory = {};
        finalWordSets.forEach(set => {
            if (!setsByCategory[set.mainTag]) {
                setsByCategory[set.mainTag] = [];
            }
            setsByCategory[set.mainTag].push(set);
        });
        
        // Merge in round-robin fashion
        const mergedSets = [];
        const categoryTags = Object.keys(setsByCategory);
        const maxSets = Math.max(...categoryTags.map(tag => setsByCategory[tag].length));
        
        for (let setIndex = 0; setIndex < maxSets; setIndex++) {
            for (let catIndex = 0; catIndex < categoryTags.length; catIndex++) {
                const categoryTag = categoryTags[catIndex];
                if (setsByCategory[categoryTag][setIndex]) {
                    mergedSets.push(setsByCategory[categoryTag][setIndex]);
                }
            }
        }

        return mergedSets.slice(0, 5);
    },

    // Generate word sets for "Odd One Out Sound" game
    generateOddOneOutSoundWordSets: (wordsData, targetConfig, selectedTag, usedWordsTracker = null) => {
        const sound1 = targetConfig.letters[0];
        const sound2 = targetConfig.letters[1];
        const totalSets = 40; // 20 sets with 3sound1+1sound2, 20 sets with 3sound2+1sound1
        
        // Separate words by sound, excluding words with both sounds
        const sound1Words = [];
        const sound2Words = [];
        
        wordsData.WORDS.forEach((word) => {
            // Filter by selected tag if any
            if (selectedTag !== null) {
                const wordTags = word.tags || [];
                if (!wordTags.includes(selectedTag)) {
                    return;
                }
            }
            
            // Get all letters in the word
            const wordLetters = _.map(word.letters, 'letter');
            const hasSound1 = wordLetters.includes(sound1);
            const hasSound2 = wordLetters.includes(sound2);
            
            // Skip words that have BOTH sounds
            if (hasSound1 && hasSound2) {
                return;
            }
            
            // Skip words that are already used in the other game type
            if (usedWordsTracker && usedWordsTracker.isWordUsedInOtherType('odd_one_out_sound', word.word)) {
                return;
            }
            
            // Add to appropriate list
            if (hasSound1 && !hasSound2) {
                sound1Words.push({
                    word: word.word,
                    img: word.img,
                    letter: sound1
                });
            } else if (hasSound2 && !hasSound1) {
                sound2Words.push({
                    word: word.word,
                    img: word.img,
                    letter: sound2
                });
            }
        });
        
        // Shuffle both lists
        const shuffledSound1 = _.shuffle([...sound1Words]);
        const shuffledSound2 = _.shuffle([...sound2Words]);
        
        // Create copies for round-robin usage
        let sound1List = [...shuffledSound1];
        let sound2List = [...shuffledSound2];
        let sound1Index = 0;
        let sound2Index = 0;
        
        // Generate sets
        const finalWordSets = [];
        
        // Generate 20 sets with 3sound1+1sound2 and 20 sets with 3sound2+1sound1
        // Alternate: 3sound1, 3sound2, 3sound1, 3sound2...
        for (let i = 0; i < totalSets; i++) {
            const isSound1Set = (i % 2 === 0); // Even indices: 3sound1+1sound2, Odd indices: 3sound2+1sound1
            
            if (isSound1Set) {
                // Generate set with 3 unique words from sound1 and 1 word from sound2
                const sound1WordsSet = [];
                const usedSound1Words = new Set(); // Track used words to avoid duplicates
                let attempts = 0;
                const maxAttempts = sound1List.length * 3; // Prevent infinite loop
                
                while (sound1WordsSet.length < 3 && attempts < maxAttempts) {
                    attempts++;
                    if (sound1Index >= sound1List.length) {
                        // Reset and reshuffle
                        sound1List = _.shuffle([...shuffledSound1]);
                        sound1Index = 0;
                    }
                    const candidateWord = sound1List[sound1Index];
                    const wordKey = candidateWord.word;
                    
                    // Check if word is already in the set
                    if (!usedSound1Words.has(wordKey)) {
                        sound1WordsSet.push(candidateWord);
                        usedSound1Words.add(wordKey);
                    }
                    sound1Index++;
                }
                
                // If we couldn't get 3 unique words, skip this set
                if (sound1WordsSet.length < 3) {
                    continue;
                }
                
                // Get 1 word from sound2 (must be different from sound1 words)
                const usedAllWords = new Set(sound1WordsSet.map(w => w.word));
                let sound2Word = null;
                attempts = 0;
                const maxSound2Attempts = sound2List.length * 2;
                
                while (!sound2Word && attempts < maxSound2Attempts) {
                    attempts++;
                    if (sound2Index >= sound2List.length) {
                        // Reset and reshuffle
                        sound2List = _.shuffle([...shuffledSound2]);
                        sound2Index = 0;
                    }
                    const candidateWord = sound2List[sound2Index];
                    const wordKey = candidateWord.word;
                    
                    // Check if word is different from sound1 words
                    if (!usedAllWords.has(wordKey)) {
                        sound2Word = candidateWord;
                    }
                    sound2Index++;
                }
                
                // If we couldn't get a unique sound2 word, skip this set
                if (!sound2Word) {
                    continue;
                }
                
                // Combine and shuffle the 4 words
                const allWords = [...sound1WordsSet, sound2Word];
                const shuffledSet = _.shuffle(allWords);
                
                // Store which word is the odd one out (index in shuffled array)
                const oddOneOutIndex = shuffledSet.findIndex(w => w === sound2Word);
                
                finalWordSets.push({
                    words: shuffledSet,
                    oddOneOutIndex: oddOneOutIndex
                });
            } else {
                // Generate set with 3 unique words from sound2 and 1 word from sound1
                const sound2WordsSet = [];
                const usedSound2Words = new Set(); // Track used words to avoid duplicates
                let attempts = 0;
                const maxAttempts = sound2List.length * 3; // Prevent infinite loop
                
                while (sound2WordsSet.length < 3 && attempts < maxAttempts) {
                    attempts++;
                    if (sound2Index >= sound2List.length) {
                        // Reset and reshuffle
                        sound2List = _.shuffle([...shuffledSound2]);
                        sound2Index = 0;
                    }
                    const candidateWord = sound2List[sound2Index];
                    const wordKey = candidateWord.word;
                    
                    // Check if word is already in the set
                    if (!usedSound2Words.has(wordKey)) {
                        sound2WordsSet.push(candidateWord);
                        usedSound2Words.add(wordKey);
                    }
                    sound2Index++;
                }
                
                // If we couldn't get 3 unique words, skip this set
                if (sound2WordsSet.length < 3) {
                    continue;
                }
                
                // Get 1 word from sound1 (must be different from sound2 words)
                const usedAllWords = new Set(sound2WordsSet.map(w => w.word));
                let sound1Word = null;
                attempts = 0;
                const maxSound1Attempts = sound1List.length * 2;
                
                while (!sound1Word && attempts < maxSound1Attempts) {
                    attempts++;
                    if (sound1Index >= sound1List.length) {
                        // Reset and reshuffle
                        sound1List = _.shuffle([...shuffledSound1]);
                        sound1Index = 0;
                    }
                    const candidateWord = sound1List[sound1Index];
                    const wordKey = candidateWord.word;
                    
                    // Check if word is different from sound2 words
                    if (!usedAllWords.has(wordKey)) {
                        sound1Word = candidateWord;
                    }
                    sound1Index++;
                }
                
                // If we couldn't get a unique sound1 word, skip this set
                if (!sound1Word) {
                    continue;
                }
                
                // Combine and shuffle the 4 words
                const allWords = [...sound2WordsSet, sound1Word];
                const shuffledSet = _.shuffle(allWords);
                
                // Store which word is the odd one out (index in shuffled array)
                const oddOneOutIndex = shuffledSet.findIndex(w => w === sound1Word);
                
                finalWordSets.push({
                    words: shuffledSet,
                    oddOneOutIndex: oddOneOutIndex
                });
            }
        }
        
        return finalWordSets;
    }
};