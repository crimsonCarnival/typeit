// game.js
import { elements, setInputDisabled, setTryAgain, updateScore, updateStats, showResults, setTimeSelectionVisible, updateTimeSelectorState } from './ui.js' 
import { updateTimer, resetTimer } from './timer.js'
import { paragraphs } from '../paragraphs.js'

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
  }
}

export const gameState = new GameState()

export const randomParagraph = () => {
  const randIndex = Math.floor(Math.random() * paragraphs.length)
  elements.textDisplay.innerHTML = ''
  elements.input.value = ''
  const paragraph = paragraphs[randIndex]
  gameState.maxScore = paragraph.length
  paragraph.split('').forEach((char) => {
    let spanTag = `<span>${char}</span>`
    elements.textDisplay.innerHTML += spanTag
  })
}

export const handleTyping = () => {
  if (elements.input.disabled) return

  // Simplified check: If timeMax is still default or 0, game hasn't started
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
    updateTimeSelectorState(true) // Disable time selector when typing starts
  }


  if (elements.input.value.length < gameState.i) {
    gameState.i--
    gameState.mistakes++
    gameState.score = Math.max(0, gameState.score - 2)
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
      gameState.score++
      updateScore(gameState.score, gameState.maxScore)
    } else {
      gameState.mistakes++
      characters[gameState.i].classList.add('incorrect')
      gameState.score = Math.max(0, gameState.score - 1)
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
    if (charTop > lineHeight * 2) {
      const newScrollTop = charTop - lineHeight;
      container.style.transition = 'transform 0.3s ease-out';
      container.style.transform = `translateY(-${newScrollTop}px)`;
    }
  }

  const totalTyped = gameState.successes + gameState.mistakes
  gameState.accuracy = totalTyped > 0 ? ((gameState.successes / totalTyped) * 100).toFixed(2) : 0

  let totalTime = Math.max(gameState.timeMax - gameState.timeLeft, 1)
  let totalChars = Math.max(gameState.i - gameState.mistakes, 0)
  let cpm = Math.floor(totalChars * (60 / totalTime)) || 0
  let wpm = Math.floor(cpm / 5) || 0
  wpm = Number.isFinite(wpm) ? wpm : 0
  cpm = Number.isFinite(cpm) ? cpm : 0

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
  // Removed hidden select reference: elements.timeDropdown.selectedIndex = 0
  setTimeSelectionVisible(true)
  gameState.isTyping = false
  updateTimeSelectorState(false) // Enable time selector when game ends
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
  // Removed hidden select reference: elements.timeDropdown.value = 0
  updateTimeSelectorState(false) // Enable time selector when game resets
  elements.input.removeEventListener('input', handleTyping)
  elements.input.addEventListener('input', handleTyping)
  const characters = elements.textDisplay.querySelectorAll('span')
  characters.forEach(span => {
    span.classList.remove('correct', 'incorrect', 'active')
  })
  elements.textDisplay.style.transform = 'translateY(0)'
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
  // Removed hidden select reference: elements.timeDropdown.value = 0;
  setTimeSelectionVisible(true);
  updateTimeSelectorState(false) // Enable time selector on next paragraph (reset)
  elements.input.removeEventListener('input', handleTyping);
  elements.input.addEventListener('input', handleTyping);
  const characters = elements.textDisplay.querySelectorAll('span');
  characters.forEach(span => {
    span.classList.remove('correct', 'incorrect', 'active');
  });
}