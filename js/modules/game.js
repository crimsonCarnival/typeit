import { elements, setInputDisabled, setTryAgain, updateScore, updateStats, showResults, setTimeSelectionVisible, updateTimeSelectorState, updateModeSelectorState, resetInputHint } from './ui.js' 
import { updateTimer, resetTimer } from './timer.js'
import { paragraphs } from '../paragraphs.js'
import { generateWordContent } from '../words.js'

let isMuted = false

const keySound = new Audio('/assets/typewriter-single-key.mp3')
const timeUpSound = new Audio('/assets/typewriter-bell.mp3')
const errorSound = new Audio('/assets/error-sound.mp3')

export const setMuted = muted => isMuted = muted

const playSound = sound => {
  if (!isMuted) {
    sound.currentTime = 0
    sound.play()
  }
}

export class GameState {
  constructor() {
    this.i = 0
    this.mistakes = 0
    this.successes = 0
    this.accuracy = 0
    this.score = 0
    this.maxScore = 0
    this.completionPercentage = 0
    this.isTyping = false
    this.timeMax = 120
    this.timeLeft = this.timeMax
    this.gameMode = 'phrases'
    this.wordCount = 50
    this.wordsBaseParagraphIndex = null
    this.preserveWordsBase = false
    this.lastWpm = 0
    this.lastCpm = 0
    this.timeMultiplier = 1.0
  }

  reset() {
    this.i = 0
    this.mistakes = 0
    this.successes = 0
    this.accuracy = 0
    this.score = 0
    this.completionPercentage = 0
    this.isTyping = false
    this.timeLeft = this.timeMax
    this.lastWpm = 0
    this.lastCpm = 0
  }

  calculateTimeMultiplier() {
    const baseTime = 60
    this.timeMultiplier = baseTime / this.timeMax
    return this.timeMultiplier
  }
}

export const gameState = new GameState()

export const randomParagraph = () => {
  elements.textDisplay.innerHTML = ''
  elements.input.value = ''
  
  let content = ''
  
  if (gameState.gameMode === 'words') {
    let idx = gameState.wordsBaseParagraphIndex
    if (idx === null || !gameState.preserveWordsBase) {
      idx = Math.floor(Math.random() * paragraphs.length)
      gameState.wordsBaseParagraphIndex = idx
    }
    content = generateWordContent(paragraphs[idx], gameState.wordCount)
    gameState.preserveWordsBase = false
  } else {
    const randIndex = Math.floor(Math.random() * paragraphs.length)
    content = paragraphs[randIndex]
    gameState.wordsBaseParagraphIndex = null
  }
  
  gameState.calculateTimeMultiplier()
  gameState.maxScore = Math.ceil(content.length * gameState.timeMultiplier)
  content.split('').forEach((char) => {
    let spanTag = `<span>${char}</span>`
    elements.textDisplay.innerHTML += spanTag
  })
}

export const handleTyping = () => {
  if (elements.input.disabled) return

  if (gameState.timeMax <= 0) {
    setInputDisabled(true);
    return;
  }

  const characters = elements.textDisplay.querySelectorAll('span')
  const typedChar = elements.input.value.split('')[gameState.i]

  playSound(keySound)

  if (!gameState.isTyping && elements.input.value.length > 0) {
    gameState.isTyping = true
    setTimeSelectionVisible(false)
    setTryAgain(true)
    updateTimer()
    updateTimeSelectorState(true)
    updateModeSelectorState(true)
  }


  if (elements.input.value.length < gameState.i) {
    gameState.i--
    gameState.mistakes++
    const penalty = Math.ceil(1 * gameState.timeMultiplier)
    gameState.score = Math.max(0, gameState.score - penalty)
    updateScore(gameState.score, gameState.maxScore)
    characters[gameState.i].classList.remove('correct', 'incorrect')
    characters.forEach(span => span.classList.remove('active'))
    characters[gameState.i].classList.add('active')
    const totalCharacters = elements.textDisplay.querySelectorAll('span').length
    gameState.completionPercentage = totalCharacters > 0 ? ((gameState.i / totalCharacters) * 100).toFixed(2) : 0
    updateStats(gameState.mistakes, gameState.accuracy, wpm, cpm, gameState.completionPercentage)
    return
  }

  if (!typedChar) {
    gameState.i--
    gameState.mistakes++
    characters[gameState.i].classList.add('active')
  } else {
    if (characters[gameState.i].innerText === typedChar) {
      gameState.successes++
      characters[gameState.i].classList.add('correct')
      const points = Math.ceil(1 * gameState.timeMultiplier)
      gameState.score += points
      updateScore(gameState.score, gameState.maxScore)
    } else {
      gameState.mistakes++
      characters[gameState.i].classList.add('incorrect')
      const penalty = Math.ceil(1 * gameState.timeMultiplier)
      gameState.score = Math.max(0, gameState.score - penalty)
      updateScore(gameState.score, gameState.maxScore)
      playSound(errorSound)
    }
    gameState.i++
  }

  characters.forEach((span) => span.classList.remove('active'))
  const activeChar = characters[gameState.i];
  if (activeChar) {
    activeChar.classList.add('active');
    const container = elements.textDisplay;
    const charTop = activeChar.offsetTop;
    const lineHeight = 24 * 1.6;
    const initialOffset = 40;
    
    const linesPassed = Math.floor(charTop / lineHeight);
    const scrollDistance = linesPassed * lineHeight;
    container.style.transition = 'transform 0.3s ease-out';
    container.style.transform = `translateY(${initialOffset - scrollDistance}px)`;
  }

  const totalTyped = gameState.successes + gameState.mistakes
  gameState.accuracy = totalTyped > 0 ? ((gameState.successes / totalTyped) * 100).toFixed(2) : 0

  let totalTime = Math.max(gameState.timeMax - gameState.timeLeft, 1)
  let totalChars = Math.max(gameState.i - gameState.mistakes, 0)
  let cpm = Math.floor(totalChars * (60 / totalTime)) || 0
  let wpm = Math.floor(cpm / 5) || 0
  wpm = Number.isFinite(wpm) ? wpm : 0
  cpm = Number.isFinite(cpm) ? cpm : 0
  gameState.lastWpm = wpm
  gameState.lastCpm = cpm

  const totalCharacters = elements.textDisplay.querySelectorAll('span').length
  gameState.completionPercentage = totalCharacters > 0 ? ((gameState.i / totalCharacters) * 100).toFixed(2) : 0

  updateStats(gameState.mistakes, gameState.accuracy, wpm, cpm, gameState.completionPercentage)

  if (gameState.completionPercentage >= 100) handleEnd()
}

export const handleEnd = () => {
  resetTimer()
  setInputDisabled(true)
  setTryAgain(true)
  elements.input.removeEventListener('input', handleTyping)
  playSound(timeUpSound)
  showResults(gameState)
  setTimeSelectionVisible(true)
  gameState.isTyping = false
  updateTimeSelectorState(false)
}

export const resetGame = () => {
  resetTimer()
  gameState.isTyping = false
  randomParagraph()
  gameState.reset()
  elements.timeDisplay.innerText = gameState.timeLeft
  updateStats(0, 0, 0, 0, 0)
  updateScore(0, gameState.maxScore)
  elements.input.value = ''
  setInputDisabled(true)
  setTimeSelectionVisible(true)
  setTryAgain(true)
  resetInputHint()
  updateTimeSelectorState(false)
  updateModeSelectorState(false)
  elements.input.removeEventListener('input', handleTyping)
  elements.input.addEventListener('input', handleTyping)
  const characters = elements.textDisplay.querySelectorAll('span')
  characters.forEach(span => {
    span.classList.remove('correct', 'incorrect', 'active')
  })
  elements.textDisplay.style.transform = 'translateY(10px)'
}

export const nextParagraph = () => {
  resetTimer();
  randomParagraph();
  gameState.reset();
  elements.timeDisplay.innerText = gameState.timeLeft;
  updateStats(0, 0, 0, 0, 0);
  updateScore(0, gameState.maxScore);
  elements.input.value = '';
  setInputDisabled(true);
  setTryAgain(true);
  setTimeSelectionVisible(true);
  updateTimeSelectorState(false)
  elements.input.removeEventListener('input', handleTyping);
  elements.input.addEventListener('input', handleTyping);
  const characters = elements.textDisplay.querySelectorAll('span');
  characters.forEach(span => {
    span.classList.remove('correct', 'incorrect', 'active');
  });
  elements.textDisplay.style.transform = 'translateY(10px)';
}