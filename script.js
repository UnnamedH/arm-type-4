// Initialize word lists from the external file
const easyWords = westernArmenianWordList.easy || [];
const mediumWords = westernArmenianWordList.medium || [];
const hardWords = westernArmenianWordList.hard || [];
const initialOnlyWords = westernArmenianWordList.initialOnly || [];

// Create a single combined word list for random selection
const allArmenianWords = westernArmenianWordList.all || [];

// Sample sentences for typing test (Western Armenian)
const sentences = [
    "Հայերէնը հին եւ հարուստ լեզու մըն է որ կը պատկանի հնդեւրոպական լեզուներու ընտանիքին:",
    "Կեանքը շատ կարճ է չարժեր որ զայն ապրինք տխուր:",
    "Աշխարհի ամենայայտնի հայերէն երգերէն մին է Դլէ Եաման:",
    "Ամէն մարդ իրաւունք ունի ազատ ապրելու եւ երջանիկ ըլլալու:",
    "Հայ մշակոյթը հարուստ է իր երաժշտութեամբ գրականութեամբ եւ արուեստով:",
    "Երեւանը Հայաստանի մայրաքաղաքն է եւ ունի երեք հազար տարուան պատմութիւն:",
    "Արարատ լեռը հայ ժողովուրդի ամենասրբազան խորհրդանիշներէն մէկն է:",
    "Հայ խոհանոցը յայտնի է իր համեղ եւ բազմազան ուտեստներով:",
    "Հայ գրականութիւնը սկիզբ առած է հինգերորդ դարուն Մեսրոպ Մաշտոցի կողմէ:",
    "Հայերը ունին մեծ սէր դէպի կրթութիւն եւ գիտութիւն:"
];

// Letter progression arrays
const initialLetters = "էնիարլ";
const middleLetters = "դոսըտեգկհբմքպվֆզւցխճ";
const finalLetters = "յձօռժչջթփշղծ";

// Default WPM requirement
let targetWPM = 20;

// Build the progressive levels based on the letter sequence
function buildLevels() {
    const levels = [];
    
    // Add first level with all initial letters unlocked together
    levels.push({
        letters: initialLetters,
        wpmRequired: targetWPM,
        newLetter: '' // No new letter for first level
    });
    
    // Start with all initial letters
    let currentLetters = initialLetters;
    
    // Add level for each middle letter
    for (let i = 0; i < middleLetters.length; i++) {
        const newLetter = middleLetters[i];
        currentLetters += newLetter;
        levels.push({
            letters: currentLetters,
            wpmRequired: targetWPM,
            newLetter: newLetter
        });
    }
    
    // Add level for each final letter
    for (let i = 0; i < finalLetters.length; i++) {
        const newLetter = finalLetters[i];
        currentLetters += newLetter;
        levels.push({
            letters: currentLetters,
            wpmRequired: targetWPM,
            newLetter: newLetter
        });
    }
    
    return levels;
}

// Generate progressive practice levels
let levels = buildLevels();

// Variables
let currentLevel = 0;
let currentSentence = '';
let currentPracticeText = '';
let startTime = null;
let practiceStartTime = null;
let isTyping = false;
let isPracticing = false;
let timerInterval = null;
let practiceTimerInterval = null;
let elapsedTime = 0;
let practiceElapsedTime = 0;

// Letter-specific tracking variables
let letterTimings = {}; // Track timings for each letter
let letterWpmStats = {}; // Store WPM for each letter
let currentLetterStartTime = null; // When a focus letter becomes the next letter to type
let letterOccurrences = {}; // Count occurrences of each letter
let letterCorrectCount = {}; // Count correctly typed instances of each letter
let expectedNextLetter = ''; // The next letter the user should type
let focusLetter = ''; // The letter being learned in the current level
let letterPerformanceHistory = {}; // Track performance history for each letter

// DOM Elements - Typing Test
const textToTypeDiv = document.getElementById('textToType');
const typingInput = document.getElementById('typingInput');
const newTestBtn = document.getElementById('newTestBtn');
const resetTestBtn = document.getElementById('resetTestBtn');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');

// DOM Elements - Progressive Practice
const practiceTextDiv = document.getElementById('practiceText');
const practiceInput = document.getElementById('practiceInput');
const newPracticeBtn = document.getElementById('newPracticeBtn');
const resetPracticeBtn = document.getElementById('resetPracticeBtn');
const practiceWpmDisplay = document.getElementById('practiceWpm');
const practiceAccuracyDisplay = document.getElementById('practiceAccuracy');
const progressBar = document.getElementById('progressBar');
const currentLevelDisplay = document.getElementById('currentLevel');
const currentLettersDisplay = document.getElementById('currentLetters');
const keyElements = document.querySelectorAll('.key');

// Letter-specific DOM elements
const letterWpmDisplay = document.getElementById('letterWpm');
const letterAccuracyDisplay = document.getElementById('letterAccuracy');
const letterProgressBar = document.getElementById('letterProgressBar');
const currentLetterDisplay = document.getElementById('currentLetterDisplay');
const letterProgressPanel = document.getElementById('letterProgressPanel');
const targetWpmDisplay = document.getElementById('targetWpmDisplay');
const letterFrequencyDisplay = document.getElementById('letterFrequency');
const letterCorrectCountDisplay = document.getElementById('letterCorrectCount');
const letterSpeedFactorDisplay = document.getElementById('letterSpeedFactor');
const currentWpmPoint = document.getElementById('currentWpmPoint');
const targetWpmLine = document.getElementById('targetWpmLine');
const midPointWpmDisplay = document.getElementById('midPointWpm');
const maxPointWpmDisplay = document.getElementById('maxPointWpm');
const letterTipsDisplay = document.getElementById('letterTips');
const letterHeatmapContainer = document.querySelector('.heatmap-container');
const letterStatsDetailsPanel = document.getElementById('letterStatsDetails');
const toggleLetterStatsButton = document.getElementById('toggleLetterStats');

// Tab navigation
const tabs = document.querySelectorAll('.tab');
const contentSections = document.querySelectorAll('.content');

// Set up tab navigation
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === tabId) {
                section.classList.add('active');
            }
        });
        
        // Initialize based on which tab is active
        if (tabId === 'typingTest') {
            initTypingTest();
        } else if (tabId === 'progressivePractice') {
            initProgressivePractice();
        }
    });
});

// INITIALIZE TYPING TEST
function initTypingTest() {
    currentSentence = getRandomSentence();
    displayText(textToTypeDiv, currentSentence);
    typingInput.value = '';
    isTyping = false;
    startTime = null;
    clearInterval(timerInterval);
    elapsedTime = 0;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '0%';
    timeDisplay.textContent = '0s';
}

// INITIALIZE PROGRESSIVE PRACTICE
function initProgressivePractice() {
    updateLevelInfo();
    currentPracticeText = generatePracticeText();
    displayText(practiceTextDiv, currentPracticeText);
    practiceInput.value = '';
    isPracticing = false;
    practiceStartTime = null;
    clearInterval(practiceTimerInterval);
    practiceElapsedTime = 0;
    practiceWpmDisplay.textContent = '0';
    practiceAccuracyDisplay.textContent = '0%';
    updateProgressBar(0);
    updateKeyboardHighlighting();
    
    // Reset letter tracking for new practice session
    resetLetterTracking();
    
    // Initialize letter stats display
    updateLetterStats();
    
    // Update letter heatmap
    updateLetterHeatmap();
    
    // Display level explanation
    const explanationElement = document.getElementById('levelExplanation');
    if (explanationElement) {
        explanationElement.textContent = getExplanationText();
    }
}

// Reset letter tracking variables
function resetLetterTracking() {
    focusLetter = levels[currentLevel].newLetter;
    letterTimings = {};
    letterOccurrences = {};
    letterCorrectCount = {};
    expectedNextLetter = '';
    currentLetterStartTime = null;
    
    // Initialize stats for current focus letter if it exists
    if (focusLetter) {
        if (!letterWpmStats[focusLetter]) {
            letterWpmStats[focusLetter] = {
                wpm: 0,
                accuracy: 0,
                totalTime: 0,
                totalOccurrences: 0,
                correctOccurrences: 0
            };
        }
        
        if (!letterPerformanceHistory[focusLetter]) {
            letterPerformanceHistory[focusLetter] = [];
        }
        
        // Show letter progress panel only if we have a focus letter
        letterProgressPanel.classList.remove('hide-letter-progress');
        currentLetterDisplay.textContent = focusLetter;
        targetWpmDisplay.textContent = targetWPM;
    } else {
        // Hide letter progress panel for level 0
        letterProgressPanel.classList.add('hide-letter-progress');
    }
}

// Get explanation text for current level
function getExplanationText() {
    const level = currentLevel + 1;
    const letters = levels[currentLevel].letters;
    let newLetter = levels[currentLevel].newLetter;
    
    let explanation = '';
    
    if (currentLevel === 0) {
        explanation = `Starting with the base letters: ${initialLetters}`;
    } else {
        explanation = `Learning letter: ${newLetter}`;
        
        // Add specific tips for the current letter
        switch(newLetter) {
            case 'դ':
                explanation += ` - Usually appears at the beginning of words like "դուռ" (door)`;
                break;
            case 'ո':
                explanation += ` - Often appears in word middle like "ոսկի" (gold)`;
                break;
            case 'ս':
                explanation += ` - Common in words like "սէր" (love)`;
                break;
            case 'ը':
                explanation += ` - Often used in words starting with "ըն" like "ընկեր" (friend)`;
                break;
            case 'տ':
                explanation += ` - In words like "տուն" (house)`;
                break;
            case 'ե':
                explanation += ` - Common vowel in words like "երազ" (dream)`;
                break;
            case 'գ':
                explanation += ` - Often starts words like "գիրք" (book)`;
                break;
            case 'կ':
                explanation += ` - Found in words like "կին" (woman)`;
                break;
            case 'հ':
                explanation += ` - Common in words like "հայր" (father)`;
                break;
            case 'բ':
                explanation += ` - Important in words like "բարի" (good)`;
                break;
            case 'մ':
                explanation += ` - Common in words like "մարդ" (person)`;
                break;
            case 'ք':
                explanation += ` - Found in words like "քոյր" (sister)`;
                break;
            case 'պ':
                explanation += ` - Used in words like "պատ" (wall)`;
                break;
            case 'վ':
                explanation += ` - Found in words like "վարդ" (rose)`;
                break;
            case 'ֆ':
                explanation += ` - Used in some loan words like "ֆիլմ" (film)`;
                break;
            case 'զ':
                explanation += ` - Appears in words like "զարդ" (jewelry)`;
                break;
            case 'յ':
                explanation += ` - Important in words like "յոյս" (hope)`;
                break;
            case 'ձ':
                explanation += ` - Found in words like "ձեռք" (hand)`;
                break;
            case 'օ':
                explanation += ` - Used in words like "օր" (day)`;
                break;
            default:
                explanation += ` - Practice this letter in common words`;
                break;
        }
    }
    
    explanation += `\nYou need ${targetWPM} WPM with 90% accuracy for this letter to advance.`;
    
    return explanation;
}

// Generate random sentence
function getRandomSentence() {
    const wordCount = parseInt(document.getElementById('wordCount').value, 10);
    const lowercase = document.getElementById('lowercaseOption').checked;
    
    // Generate string of random words from the combined word list
    let result = '';
    for (let i = 0; i < wordCount; i++) {
        const randomWord = allArmenianWords[Math.floor(Math.random() * allArmenianWords.length)];
        result += randomWord + ' ';
    }
    
    result = result.trim();
    return lowercase ? result.toLowerCase() : result;
}

// Generate practice text for current level
function generatePracticeText() {
    const availableLetters = levels[currentLevel].letters;
    const wordCount = parseInt(document.getElementById('practiceWordCount').value, 10);
    const lowercase = document.getElementById('practiceLowercaseOption').checked;
    
    // Get the newly unlocked letter (if any)
    const newLetter = levels[currentLevel].newLetter;
    
    // Function to check if a word can be typed with the available letters
    function canTypeWithAvailableLetters(word, letters) {
        for (let i = 0; i < word.length; i++) {
            if (!letters.includes(word[i].toLowerCase())) {
                return false;
            }
        }
        return true;
    }
    
    // Function to check if a word contains a specific letter
    function containsLetter(word, letter) {
        return word.toLowerCase().includes(letter.toLowerCase());
    }
    
    // Filter words that can be typed with available letters
    const possibleWords = allArmenianWords.filter(word => 
        canTypeWithAvailableLetters(word, availableLetters)
    );
    
    // If we have a new letter, filter words that contain it
    let newLetterWords = [];
    if (newLetter) {
        newLetterWords = possibleWords.filter(word => 
            containsLetter(word, newLetter)
        );
    }
    
    // Generate text with the possible words
    let text = '';
    let selectedWords = [];
    
    if (possibleWords.length > 0) {
        // Determine how many words should include the new letter (90% if there is a new letter)
        const newLetterWordCount = newLetter ? Math.floor(wordCount * 0.9) : 0;
        const otherWordCount = wordCount - newLetterWordCount;
        
        // Add words that contain the new letter
        if (newLetterWords.length > 0 && newLetterWordCount > 0) {
            for (let i = 0; i < newLetterWordCount; i++) {
                if (newLetterWords.length > 0) {
                    const randomIndex = Math.floor(Math.random() * newLetterWords.length);
                    selectedWords.push(newLetterWords[randomIndex]);
                    // Optional: remove the selected word to avoid repetition
                    // newLetterWords.splice(randomIndex, 1);
                } else {
                    // If we run out of suitable words, generate a random one with the new letter
                    selectedWords.push(generateRandomWordWithLetter(availableLetters, newLetter));
                }
            }
        }
        
        // Add other words that don't necessarily contain the new letter
        const otherWords = newLetter ? 
            possibleWords.filter(word => !containsLetter(word, newLetter)) : 
            possibleWords;
            
        for (let i = 0; i < otherWordCount; i++) {
            if (otherWords.length > 0) {
                const randomIndex = Math.floor(Math.random() * otherWords.length);
                selectedWords.push(otherWords[randomIndex]);
                // Optional: remove the selected word to avoid repetition
                // otherWords.splice(randomIndex, 1);
            } else {
                // If we run out of suitable words, use any possible word
                const randomIndex = Math.floor(Math.random() * possibleWords.length);
                selectedWords.push(possibleWords[randomIndex]);
            }
        }
        
        // Shuffle the words to make the text less predictable
        selectedWords = shuffleArray(selectedWords);
        text = selectedWords.join(' ');
    }
    
    // If we still don't have enough words, generate random ones
    if (selectedWords.length < wordCount) {
        const wordsNeeded = wordCount - selectedWords.length;
        
        for (let i = 0; i < wordsNeeded; i++) {
            if (newLetter && (i < Math.ceil(wordsNeeded * 0.9))) {
                // 90% of additional words should include the new letter
                text += ' ' + generateRandomWordWithLetter(availableLetters, newLetter);
            } else {
                // The rest are just random words with available letters
                text += ' ' + generateRandomWord(availableLetters);
            }
        }
    }
    
    text = text.trim();
    return lowercase ? text.toLowerCase() : text;
}

// Helper function to generate a random word with available letters
function generateRandomWord(availableLetters) {
    // Random word length between 2 and 5 characters
    const wordLength = Math.floor(Math.random() * 4) + 2;
    let word = '';
    
    for (let j = 0; j < wordLength; j++) {
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        word += availableLetters.charAt(randomIndex);
    }
    
    return word;
}

// Helper function to generate a random word that contains a specific letter
function generateRandomWordWithLetter(availableLetters, targetLetter) {
    // Random word length between 3 and 6 characters (to ensure there's room for the target letter)
    const wordLength = Math.floor(Math.random() * 4) + 3;
    let word = '';
    
    // Decide on a random position for the target letter
    const targetPosition = Math.floor(Math.random() * wordLength);
    
    for (let j = 0; j < wordLength; j++) {
        if (j === targetPosition) {
            // Insert the target letter at the chosen position
            word += targetLetter;
        } else {
            // For other positions, use random available letters
            const randomIndex = Math.floor(Math.random() * availableLetters.length);
            word += availableLetters.charAt(randomIndex);
        }
    }
    
    return word;
}

// Helper function to shuffle an array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Display text with character spans
function displayText(container, text) {
    // Break the text into individual characters
    const charSpans = text.split('').map(char => {
        // Create a span for each character
        return `<span class="char">${char}</span>`;
    }).join('');
    
    // Set the HTML content of the container
    container.innerHTML = charSpans;
    
    // If this is practice text, highlight the focus letter
    if (container === practiceTextDiv) {
        const newLetter = levels[currentLevel].newLetter;
        if (newLetter) {
            // Highlight the current level's new letter
            const chars = container.querySelectorAll('.char');
            chars.forEach(charSpan => {
                if (charSpan.textContent.toLowerCase() === newLetter.toLowerCase()) {
                    charSpan.classList.add('focus-letter');
                }
            });
        }
        
        // Initialize expectedNextLetter to the first character
        if (text.length > 0) {
            expectedNextLetter = text[0];
        }
    }
}

// Calculate correct characters
function calculateCorrectCharacters(typed, original) {
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
        if (i < original.length && typed[i] === original[i]) {
            correct++;
        }
    }
    return correct;
}

// Update character highlighting
function updateCharacterHighlighting(typed, container) {
    const chars = container.querySelectorAll('.char');
    
    for (let i = 0; i < chars.length; i++) {
        chars[i].classList.remove('correct', 'incorrect', 'current');
        
        if (i < typed.length) {
            if (typed[i] === chars[i].textContent) {
                chars[i].classList.add('correct');
            } else {
                chars[i].classList.add('incorrect');
            }
        } else if (i === typed.length) {
            chars[i].classList.add('current');
            
            // Update expectedNextLetter
            if (i < chars.length) {
                expectedNextLetter = chars[i].textContent;
                
                // If the expected next letter is our focus letter, start timing it
                if (focusLetter && expectedNextLetter.toLowerCase() === focusLetter.toLowerCase() && isPracticing) {
                    if (!letterTimings[i]) {
                        currentLetterStartTime = new Date().getTime();
                        letterTimings[i] = { startTime: currentLetterStartTime, endTime: null };
                        
                        // Increment occurrence counter for this letter
                        letterOccurrences[focusLetter] = (letterOccurrences[focusLetter] || 0) + 1;
                    }
                }
            }
        }
    }
}

// Update progress bar
function updateProgressBar(progress) {
    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';
}

// Update letter progress bar
function updateLetterProgressBar(progress) {
    letterProgressBar.style.width = progress + '%';
    letterProgressBar.textContent = progress + '%';
}

// Update level info
function updateLevelInfo() {
    currentLevelDisplay.textContent = currentLevel + 1;
    currentLettersDisplay.textContent = levels[currentLevel].letters;
}

// Update keyboard highlighting to emphasize the new letter being learned
function updateKeyboardHighlighting() {
    const availableLetters = levels[currentLevel].letters;
    const newLetter = levels[currentLevel].newLetter;
    
    keyElements.forEach(key => {
        const char = key.getAttribute('data-char');
        key.classList.remove('unlocked', 'locked', 'new-letter');
        
        if (availableLetters.includes(char)) {
            key.classList.add('unlocked');
            
            // Highlight the new letter being learned
            if (newLetter && char === newLetter) {
                key.classList.add('new-letter');
            }
        } else if (char !== ' ') {
            key.classList.add('locked');
        }
    });
    
    // If we have a new letter for this level, highlight it in the practice text
    if (newLetter && practiceTextDiv) {
        const chars = practiceTextDiv.querySelectorAll('.char');
        chars.forEach(charSpan => {
            charSpan.classList.remove('focus-letter');
            if (charSpan.textContent.toLowerCase() === newLetter.toLowerCase()) {
                charSpan.classList.add('focus-letter');
            }
        });
    }
}

// Highlight key when pressed
function highlightKey(key) {
    const keyElement = document.querySelector(`.key[data-char="${key}"]`);
    if (keyElement) {
        keyElement.classList.add('highlight');
        setTimeout(() => {
            keyElement.classList.remove('highlight');
        }, 200);
    }
}

// Update typing test metrics
function updateTypingMetrics() {
    if (!startTime || !isTyping) return;
    
    const currentTime = new Date().getTime();
    elapsedTime = (currentTime - startTime) / 1000; // in seconds
    
    // Calculate WPM (assuming 5 characters per word)
    const typedText = typingInput.value;
    const wordsTyped = typedText.length / 5;
    const minutes = elapsedTime / 60;
    const wpm = Math.round(wordsTyped / minutes);
    
    // Calculate accuracy
    const correctChars = calculateCorrectCharacters(typedText, currentSentence);
    const accuracy = Math.round((correctChars / typedText.length) * 100) || 0;
    
    // Update displays
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy + '%';
    timeDisplay.textContent = elapsedTime.toFixed(1) + 's';
    
    // Update character highlighting
    updateCharacterHighlighting(typedText, textToTypeDiv);
    
    // Check if completed
    if (typedText.length >= currentSentence.length) {
        clearInterval(timerInterval);
        isTyping = false;
        
        // Show results modal
        showResultsModal(wpm, accuracy, elapsedTime.toFixed(1));
    }
}

// Update practice metrics
function updatePracticeMetrics() {
    if (!practiceStartTime || !isPracticing) return;
    
    const currentTime = new Date().getTime();
    practiceElapsedTime = (currentTime - practiceStartTime) / 1000; // in seconds
    
    // Calculate WPM
    const typedText = practiceInput.value;
    const wordsTyped = typedText.length / 5;
    const minutes = practiceElapsedTime / 60;
    const wpm = Math.round(wordsTyped / minutes);
    
    // Calculate accuracy
    const correctChars = calculateCorrectCharacters(typedText, currentPracticeText);
    const accuracy = Math.round((correctChars / typedText.length) * 100) || 0;
    
    // Update displays
    practiceWpmDisplay.textContent = wpm;
    practiceAccuracyDisplay.textContent = accuracy + '%';
    
    // Update character highlighting
    updateCharacterHighlighting(typedText, practiceTextDiv);
    
    // Update progress
    const requiredWpm = levels[currentLevel].wpmRequired;
    const progress = Math.min(100, Math.round((wpm / requiredWpm) * 100));
    updateProgressBar(progress);
    
    // Calculate and update letter-specific metrics
    updateLetterStats();
    
    // Check if completed
    if (typedText.length >= currentPracticeText.length) {
        checkLevelCompletion(wpm, accuracy);
    }
}

// Process letter WPM calculation
function processLetterTyped(typedChar, expectedChar, position) {
    // Check if there's a focus letter for this level
    if (!focusLetter) return;
    
    // If the expected letter is our focus letter and we have a timing started for it
    if (expectedChar.toLowerCase() === focusLetter.toLowerCase() && letterTimings[position]) {
        // Record end time
        const endTime = new Date().getTime();
        letterTimings[position].endTime = endTime;
        
        // Calculate time taken to type this letter (in seconds)
        const timeTaken = (endTime - letterTimings[position].startTime) / 1000;
        
        // Check if the letter was typed correctly
        const isCorrect = typedChar === expectedChar;
        
        // Update correct count for this letter
        if (isCorrect) {
            letterCorrectCount[focusLetter] = (letterCorrectCount[focusLetter] || 0) + 1;
        }
        
        // Update letter stats
        if (letterWpmStats[focusLetter]) {
            // Only include correctly typed letters
            if (isCorrect) {
                // A single character is 1/5 of a word. Convert to WPM for this single action
                // wpm = (1/5) / (timeTaken / 60) = 12 / timeTaken
                const instantWpm = Math.round(12 / timeTaken);
                
                // Update stats
                letterWpmStats[focusLetter].totalTime += timeTaken;
                letterWpmStats[focusLetter].totalOccurrences++;
                letterWpmStats[focusLetter].correctOccurrences += isCorrect ? 1 : 0;
                
                // Calculate average WPM for this letter
                if (letterWpmStats[focusLetter].totalOccurrences > 0) {
                    const avgTimeTaken = letterWpmStats[focusLetter].totalTime / letterWpmStats[focusLetter].totalOccurrences;
                    letterWpmStats[focusLetter].wpm = Math.round(12 / avgTimeTaken);
                    letterWpmStats[focusLetter].accuracy = Math.round((letterWpmStats[focusLetter].correctOccurrences / letterWpmStats[focusLetter].totalOccurrences) * 100);
                }
                
                // Add to performance history (for graphs/charts)
                letterPerformanceHistory[focusLetter].push({
                    timestamp: new Date().getTime(),
                    wpm: instantWpm,
                    isCorrect: isCorrect
                });
            }
        }
    }
}

// Update letter stats display
function updateLetterStats() {
    // If there's no focus letter, return
    if (!focusLetter) return;
    
    // Get stats for the current focus letter
    const stats = letterWpmStats[focusLetter] || { wpm: 0, accuracy: 0, totalOccurrences: 0, correctOccurrences: 0 };
    
    // Update letter-specific metrics displays
    letterWpmDisplay.textContent = stats.wpm || 0;
    letterAccuracyDisplay.textContent = (stats.accuracy || 0) + '%';
    
    // Calculate letter progress as percentage of target WPM
    const letterProgress = Math.min(100, Math.round((stats.wpm / targetWPM) * 100)) || 0;
    updateLetterProgressBar(letterProgress);
    
    // Update detailed stats if they exist
    if (letterFrequencyDisplay) {
        const totalChars = practiceInput.value.length;
        const letterFrequency = totalChars > 0 ? Math.round((letterOccurrences[focusLetter] || 0) / totalChars * 100) : 0;
        letterFrequencyDisplay.textContent = letterFrequency + '%';
    }
    
    if (letterCorrectCountDisplay) {
        letterCorrectCountDisplay.textContent = `${letterCorrectCount[focusLetter] || 0}/${letterOccurrences[focusLetter] || 0}`;
    }
    
    if (letterSpeedFactorDisplay) {
        // Calculate the speed factor - how this letter compares to overall typing speed
        const overallWpm = parseInt(practiceWpmDisplay.textContent) || 1;
        const letterWpm = stats.wpm || 1;
        const speedFactor = (letterWpm / overallWpm).toFixed(1);
        letterSpeedFactorDisplay.textContent = speedFactor + 'x';
    }
    
    // Update WPM progress chart
    if (currentWpmPoint && targetWpmLine) {
        const maxWpm = Math.max(targetWPM * 2, stats.wpm);
        const wpmPercentage = Math.min(100, (stats.wpm / maxWpm) * 100);
        
        currentWpmPoint.style.left = wpmPercentage + '%';
        targetWpmLine.style.left = (targetWPM / maxWpm) * 100 + '%';
        
        // Update scale labels
        if (midPointWpmDisplay) midPointWpmDisplay.textContent = Math.round(maxWpm / 2);
        if (maxPointWpmDisplay) maxPointWpmDisplay.textContent = maxWpm;
    }
    
    // Update improvement tips
    if (letterTipsDisplay) {
        const tips = [];
        
        if (stats.wpm < targetWPM * 0.5) {
            tips.push('Focus on consistent typing rhythm for this letter');
            tips.push('Try typing short words containing this letter repeatedly');
        } else if (stats.wpm < targetWPM * 0.8) {
            tips.push('You\'re improving! Keep practicing to build muscle memory');
            tips.push('Focus on accuracy first, then gradually increase speed');
        } else if (stats.wpm < targetWPM) {
            tips.push('Almost there! Try typing slightly faster while maintaining accuracy');
            tips.push('You\'re very close to mastering this letter');
        } else {
            tips.push('Great job! You\'ve reached the target speed for this letter');
            tips.push('Try to maintain this performance consistently');
        }
        
        // Update the tips display
        letterTipsDisplay.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }
}

// Update letter heatmap
function updateLetterHeatmap() {
    // If letterHeatmapContainer doesn't exist, return
    if (!letterHeatmapContainer) return;
    
    // Clear existing content
    letterHeatmapContainer.innerHTML = '';
    
    // Get all available letters
    const availableLetters = levels[currentLevel].letters;
    
    // Create a cell for each letter
    for (let i = 0; i < availableLetters.length; i++) {
        const letter = availableLetters[i];
        const stats = letterWpmStats[letter] || { wpm: 0, accuracy: 0 };
        
        // Create letter cell
        const letterCell = document.createElement('div');
        letterCell.className = 'heatmap-letter';
        letterCell.textContent = letter;
        letterCell.setAttribute('data-wpm', stats.wpm || 0);
        
        // Add performance class based on WPM
        if (letter === levels[currentLevel].newLetter) {
            // Focus letter
            if (stats.wpm < targetWPM * 0.5) {
                letterCell.classList.add('needs-work');
            } else if (stats.wpm < targetWPM) {
                letterCell.classList.add('improving');
            } else {
                letterCell.classList.add('good');
            }
        } else if (i > availableLetters.indexOf(levels[currentLevel].newLetter)) {
            // Letters that are not yet unlocked
            letterCell.classList.add('not-learned');
        } else {
            // Previously learned letters
            if (stats.wpm < targetWPM * 0.5) {
                letterCell.classList.add('needs-work');
            } else if (stats.wpm < targetWPM) {
                letterCell.classList.add('improving');
            } else {
                letterCell.classList.add('good');
            }
        }
        
        letterHeatmapContainer.appendChild(letterCell);
    }
}

// Check level completion and advance if necessary
function checkLevelCompletion(wpm, accuracy) {
    clearInterval(practiceTimerInterval);
    isPracticing = false;
    
    // Get the focus letter WPM and accuracy
    const focusLetter = levels[currentLevel].newLetter;
    let letterWpm = 0;
    let letterAccuracy = 0;
    
    if (focusLetter && letterWpmStats[focusLetter]) {
        letterWpm = letterWpmStats[focusLetter].wpm || 0;
        letterAccuracy = letterWpmStats[focusLetter].accuracy || 0;
    } else {
        // If no focus letter (level 0) or no stats, use overall metrics
        letterWpm = wpm;
        letterAccuracy = accuracy;
    }
    
    const requiredWpm = levels[currentLevel].wpmRequired;
    
    if (letterWpm >= requiredWpm && letterAccuracy >= 90) {
        if (currentLevel < levels.length - 1) {
            currentLevel++;
            setTimeout(() => {
                alert(`Great job! You have advanced to level ${currentLevel + 1}.`);
                initProgressivePractice();
            }, 500);
        } else {
            setTimeout(() => {
                alert('Congratulations! You have completed all levels!');
                initProgressivePractice();
            }, 500);
        }
    } else {
        setTimeout(() => {
            alert(`You need at least ${requiredWpm} WPM with 90% accuracy on the letter "${focusLetter}" to advance. Try again!`);
            initProgressivePractice();
        }, 500);
    }
}

// Show results modal
function showResultsModal(wpm, accuracy, time) {
    document.getElementById('modalWpm').textContent = wpm;
    document.getElementById('modalAccuracy').textContent = accuracy + '%';
    document.getElementById('modalTime').textContent = time + 's';
    
    const modal = document.getElementById('resultsModal');
    modal.style.display = 'flex';
}

// Hide results modal and start new test
function hideResultsModal() {
    const modal = document.getElementById('resultsModal');
    modal.style.display = 'none';
    initTypingTest();
}

// Save settings
function saveSettings() {
    targetWPM = parseInt(document.getElementById('targetWPM').value, 10);
    
    // Ensure the target WPM is within reasonable bounds
    if (targetWPM < 5) targetWPM = 5;
    if (targetWPM > 100) targetWPM = 100;
    
    // Update the input value to reflect any adjustments
    document.getElementById('targetWPM').value = targetWPM;
    
    // Rebuild levels with new WPM target
    levels = buildLevels();
    
    // Reset and initialize the practice with new settings
    currentLevel = 0;  // Reset to first level
    initProgressivePractice();
    
    // Provide feedback
    alert(`Settings saved! Target WPM is now ${targetWPM}.`);
}

// EVENT LISTENERS

// Typing Test Input
typingInput.addEventListener('input', () => {
    if (!isTyping) {
        isTyping = true;
        startTime = new Date().getTime();
        timerInterval = setInterval(updateTypingMetrics, 100);
    }
    updateTypingMetrics();
});

// Practice Input
practiceInput.addEventListener('input', (e) => {
    if (!isPracticing) {
        isPracticing = true;
        practiceStartTime = new Date().getTime();
        practiceTimerInterval = setInterval(updatePracticeMetrics, 100);
    }
    
    const typedText = practiceInput.value;
    const typedLength = typedText.length;
    
    // If a character was added (not deleted)
    if (typedLength > 0 && e.inputType !== 'deleteContentBackward') {
        const typedChar = typedText[typedLength - 1];
        const position = typedLength - 1;
        
        // If we have an expected character at this position
        if (position < currentPracticeText.length) {
            const expectedChar = currentPracticeText[position];
            
            // Process letter-specific timing
            processLetterTyped(typedChar, expectedChar, position);
        }
    }
    
    updatePracticeMetrics();
    
    // Highlight key pressed
    const lastChar = practiceInput.value.charAt(practiceInput.value.length - 1);
    if (lastChar) {
        highlightKey(lastChar);
    }
});

// Key press for highlighting on typing test
typingInput.addEventListener('keypress', (e) => {
    highlightKey(e.key);
});

// Toggle letter stats details
if (toggleLetterStatsButton && letterStatsDetailsPanel) {
    toggleLetterStatsButton.addEventListener('click', () => {
        if (letterStatsDetailsPanel.classList.contains('active')) {
            letterStatsDetailsPanel.classList.remove('active');
            toggleLetterStatsButton.textContent = 'Show Details';
        } else {
            letterStatsDetailsPanel.classList.add('active');
            toggleLetterStatsButton.textContent = 'Hide Details';
        }
    });
}

// New Test Button
newTestBtn.addEventListener('click', initTypingTest);

// Reset Test Button
resetTestBtn.addEventListener('click', initTypingTest);

// New Practice Button
newPracticeBtn.addEventListener('click', initProgressivePractice);

// Reset Practice Button
resetPracticeBtn.addEventListener('click', initProgressivePractice);

// Settings Save Button
document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

// Next Test Button (in modal)
document.getElementById('nextTestBtn').addEventListener('click', hideResultsModal);

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
    // Enter key to dismiss completion notification
    if (e.key === 'Enter' && !e.ctrlKey && document.getElementById('resultsModal').style.display === 'flex') {
        hideResultsModal();
    }
    
    // Ctrl+Enter to reset text and start a new one
    if (e.key === 'Enter' && e.ctrlKey) {
        if (document.getElementById('typingTest').classList.contains('active')) {
            initTypingTest();
        } else if (document.getElementById('progressivePractice').classList.contains('active')) {
            initProgressivePractice();
        }
    }
});

// Handle word list file import/export
document.getElementById('exportWordListBtn').addEventListener('click', () => {
    // Create a data URL for the wordlist
    const wordListData = JSON.stringify(westernArmenianWordList, null, 2);
    const blob = new Blob([`const westernArmenianWordList = ${wordListData};`], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'armenian_wordlist.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('importWordListBtn').addEventListener('click', () => {
    // Trigger the hidden file input
    document.getElementById('wordListFileInput').click();
});

document.getElementById('wordListFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                // Parse the file content and update the wordlist
                const fileContent = event.target.result;
                // Use Function constructor to safely evaluate the JS content
                new Function(fileContent)();
                
                // Refresh word lists from the updated global variable
                if (typeof westernArmenianWordList !== 'undefined') {
                    // Rebuild the all array
                    westernArmenianWordList.all = [];
                    
                    // Add words from each category
                    const addWords = (sourceArray) => {
                        if (Array.isArray(sourceArray)) {
                            for (const word of sourceArray) {
                                if (!westernArmenianWordList.all.includes(word)) {
                                    westernArmenianWordList.all.push(word);
                                }
                            }
                        }
                    };
                    
                    addWords(westernArmenianWordList.easy);
                    addWords(westernArmenianWordList.medium);
                    addWords(westernArmenianWordList.hard);
                    addWords(westernArmenianWordList.initialOnly);
                    
                    alert('Word list successfully imported!');
                    initTypingTest();
                    initProgressivePractice();
                } else {
                    alert('Invalid word list file. Please make sure it contains a westernArmenianWordList object.');
                }
            } catch (error) {
                alert('Error importing word list: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});

// Initialize on load
window.addEventListener('load', () => {
    initTypingTest();
    initProgressivePractice();
});