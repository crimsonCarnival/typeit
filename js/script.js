import { elements, setInputDisabled, setTryAgain, setupDragHandlers, setupHorizontalTimeDropdown, setTimeSelectionVisible, setupHorizontalModeDropdown, setupHorizontalWordCountDropdown } from './modules/ui.js'
import { gameState, handleTyping, resetGame, randomParagraph, nextParagraph, setMuted } from './modules/game.js'
import { startTimer } from './modules/timer.js'

setupDragHandlers()
setupHorizontalTimeDropdown()
setupHorizontalModeDropdown()
setupHorizontalWordCountDropdown()

window.resetGame = resetGame

const handleHotkeys = (event) => {
  const activeEl = document.activeElement
  const isTyping = activeEl && activeEl.classList.contains('input-field')

  if (event.key === 'Escape') {
    if (!elements.alertCard.classList.contains('hidden')) {
      elements.alertCard.classList.add('hidden')
      document.querySelector('.result-details').classList.remove('hidden')
    }
    resetGame()
  }

  if (event.key.toLowerCase() === 't' && !isTyping) {
    const el = document.getElementById('theme-toggle')
    if (el) el.click()
  }
}

document.addEventListener('keydown', handleHotkeys)

if (elements.closeAlertButton) {
  elements.closeAlertButton.addEventListener('click', () => {
    elements.alertCard.classList.add('hidden')
    document.querySelector('.result-details').classList.remove('hidden')
    resetGame()
    setInputDisabled(false)
  })
}

if (elements.input && elements.input.disabled) {
  setTryAgain(false)
}

randomParagraph()

import { updateScore } from './modules/ui.js'
updateScore(0, gameState.maxScore)

if (elements.input) {
  elements.input.addEventListener('input', handleTyping)
}

if (elements.tryAgain) elements.tryAgain.addEventListener('click', resetGame)

const nextParagraphBtn = document.getElementById('next-paragraph')
if (nextParagraphBtn) {
  nextParagraphBtn.addEventListener('click', nextParagraph)
}

const soundToggle = document.getElementById('sound-toggle')
if (soundToggle) {
  const savedMute = localStorage.getItem('soundMuted')
  const muted = savedMute === 'true'
  soundToggle.classList.toggle('active', !muted)
  const icon = soundToggle.querySelector('i')
  if (icon) {
    icon.className = muted ? 'fas fa-volume-xmark' : 'fas fa-volume-up'
  }
  setMuted(muted)

  soundToggle.addEventListener('click', () => {
    const willBeActive = !soundToggle.classList.contains('active')
    soundToggle.classList.toggle('active', willBeActive)
    const nowMuted = !willBeActive
    const icon = soundToggle.querySelector('i')
    if (icon) {
      icon.className = nowMuted ? 'fas fa-volume-xmark' : 'fas fa-volume-up'
    }
    setMuted(nowMuted)
    localStorage.setItem('soundMuted', nowMuted.toString())
  })
}

document.addEventListener('keydown', (event) => {
  const activeEl = document.activeElement
  const isTyping = activeEl && activeEl.classList.contains('input-field')

  if (event.key.toLowerCase() === 'm' && !isTyping) {
    if (soundToggle) {
      const willBeActive = !soundToggle.classList.contains('active')
      soundToggle.classList.toggle('active', willBeActive)
      const nowMuted = !willBeActive
      setMuted(nowMuted)
      localStorage.setItem('soundMuted', nowMuted.toString())
    }
  }
})

const themeToggle = document.getElementById('theme-toggle')
if (themeToggle) {
  const savedTheme = localStorage.getItem('theme')
  const isDark = savedTheme === 'dark'
  document.body.classList.toggle('dark', isDark)
  themeToggle.classList.toggle('active', isDark)

  const applyTheme = (dark) => {
    document.body.classList.toggle('dark', dark)
    themeToggle.classList.toggle('active', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  themeToggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark')
    applyTheme(dark)
  })
}

if (elements.toggleHintsBtn && elements.hotkeyItems) {
  const saved = localStorage.getItem('shortcutsVisible')
  const visible = saved === null ? true : saved === 'true'
  if (!visible) {
    elements.hotkeyItems.classList.add('hidden')
    const txt = elements.toggleHintsBtn.querySelector('.hints-toggle-text')
    if (txt) txt.textContent = 'Show Shortcuts'
  }

  elements.toggleHintsBtn.addEventListener('click', () => {
    elements.hotkeyItems.classList.toggle('hidden')
    const isHidden = elements.hotkeyItems.classList.contains('hidden')
    const txt = elements.toggleHintsBtn.querySelector('.hints-toggle-text')
    if (txt) txt.textContent = isHidden ? 'Show Shortcuts' : 'Hide Shortcuts'
    localStorage.setItem('shortcutsVisible', (!isHidden).toString())
  })
}