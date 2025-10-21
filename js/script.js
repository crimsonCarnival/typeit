// script.js
import { elements, setInputDisabled, setTryAgain, setupDragHandlers, setupHorizontalTimeDropdown, setTimeSelectionVisible } from './modules/ui.js'
import { gameState, handleTyping, resetGame, randomParagraph, nextParagraph, setMuted } from './modules/game.js'
import { startTimer } from './modules/timer.js'
import { toggleMode } from './modules/theme.js'

// Initialize drag functionality & UI helpers
setupDragHandlers()
setupHorizontalTimeDropdown()

// REMOVED: Time selector event handler for the now-removed hidden select

// Handle escape key and theme toggle
const handleHotkeys = (event) => {
  const activeEl = document.activeElement
  const isTyping = activeEl && activeEl.classList.contains('input-field')

  if (event.key === 'Escape') {
    // If alert is visible, close it
    if (!elements.alertCard.classList.contains('hidden')) {
      elements.alertCard.classList.add('hidden')
      document.querySelector('.result-details').classList.remove('hidden')
    }
    // Always reset game on Esc
    resetGame()
  }

  if (event.key.toLowerCase() === 't' && !isTyping) {
    elements.themeToggle.checked = !elements.themeToggle.checked
    elements.themeToggle.dispatchEvent(new Event('change'))
  }
}

document.addEventListener('keydown', handleHotkeys)

// Close alert handlers
if (elements.closeAlertButton) {
  elements.closeAlertButton.addEventListener('click', () => {
    elements.alertCard.classList.add('hidden')
    document.querySelector('.result-details').classList.remove('hidden')
    resetGame()
    setInputDisabled(false)
  })
}

// Initialize game
if (elements.input && elements.input.disabled) {
  setTryAgain(false)
}

// Set up event listeners
randomParagraph()

if (elements.input) {
  elements.input.addEventListener('input', handleTyping)
}

if (elements.tryAgain) elements.tryAgain.addEventListener('click', resetGame)
if (elements.themeToggle) elements.themeToggle.addEventListener('click', toggleMode)

const nextParagraphBtn = document.getElementById('next-paragraph')
if (nextParagraphBtn) {
  nextParagraphBtn.addEventListener('click', nextParagraph)
}

// --- Mute functionality ---
const soundToggle = document.getElementById('sound-toggle')
if (soundToggle) {
  soundToggle.addEventListener('change', () => {
    setMuted(!soundToggle.checked)
    localStorage.setItem('soundMuted', (!soundToggle.checked).toString())
  })
}

// Handle 'M' key toggle
document.addEventListener('keydown', (event) => {
  const activeEl = document.activeElement
  const isTyping = activeEl && activeEl.classList.contains('input-field')

  if (event.key.toLowerCase() === 'm' && !isTyping) {
    if (soundToggle) {
      soundToggle.checked = !soundToggle.checked
      setMuted(!soundToggle.checked)
      localStorage.setItem('soundMuted', (!soundToggle.checked).toString())
    }
  }
})

// Restore saved mute state
const savedMute = localStorage.getItem('soundMuted')
if (savedMute !== null && soundToggle) {
  const muted = savedMute === 'true'
  soundToggle.checked = !muted
  setMuted(muted)
}

// --- Dark mode persistence ---
const themeToggle = document.getElementById('theme-toggle')
if (themeToggle) {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.body.classList.add('dark')
    themeToggle.checked = true
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  })
}