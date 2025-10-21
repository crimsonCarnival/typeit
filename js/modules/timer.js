import { elements } from './ui.js'
import { gameState, handleEnd } from './game.js'

let timer = null

export const updateTimer = () => {
  if (gameState.timeLeft > 0) {
    timer = setInterval(() => {
      gameState.timeLeft--
      elements.timeDisplay.innerText = gameState.timeLeft
      if (gameState.timeLeft <= 0) {
        handleEnd()
      }
    }, 1000)
  }
}

export const resetTimer = () => {
  clearInterval(timer)
  timer = null
}

export const startTimer = (onTimeUp) => {
  if (!gameState.isTyping) {
    updateTimer(onTimeUp)
    gameState.isTyping = true
  }
}