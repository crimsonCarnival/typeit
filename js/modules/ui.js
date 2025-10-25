import { gameState } from './game.js' 

export const elements = {
  textDisplay: document.querySelector('.typing-text p'),
  input: document.querySelector('.top-controls .input-field'),
  inputIndicator: document.querySelector('.input-indicator'),
  mistakeCount: document.querySelector('.mistake span'),
  accuracyDisplay: document.querySelector('.accuracy span'),
  timeDisplay: document.querySelector('.time span b'),
  tryAgain: document.querySelector('.content button'),
  scoreDisplay: document.querySelector('.score-container #score'),
  alertCard: document.querySelector('.alert-card'),
  finalScoreDisplay: document.querySelector('#final-score'),
  finalMistakesDisplay: document.querySelector('#final-mistakes'),
  finalAccuracyDisplay: document.querySelector('#final-accuracy'),
  finalWpmDisplay: document.querySelector('#final-wpm'),
  finalCpmDisplay: document.querySelector('#final-cpm'),
  closeAlertButton: document.querySelector('#close-alert'),
  progressFill: document.querySelector('#progress-fill'),
  themeToggle: document.querySelector('#theme-toggle'),
  draggable: document.querySelector('.draggable'),
  wrapper: document.querySelector('.wrapper'),
  hotkeyItems: document.querySelector('.shortcuts-footer .hotkey-items'),
  toggleHintsBtn: document.querySelector('.shortcuts-footer .toggle-hints-btn'),
  hotkeyHint: document.querySelector('.shortcuts-footer .hotkey-hint')
}

let initialAlertX = 0
let initialAlertY = 0
let isDraggingAlert = false

export const setTimeSelectionVisible = (showSelector = true) => {
  const headerDropdown = document.querySelector('.horizontal-time-dropdown')
  
  if (headerDropdown) {
    headerDropdown.style.display = showSelector ? 'inline-flex' : 'none'
  }

  const timeDisplay = document.querySelector('.header-time')
  if (timeDisplay) {
    timeDisplay.style.display = showSelector ? 'none' : 'block'
  }
}

export const setInputDisabled = (isDisabled) => {
  elements.input.disabled = isDisabled
}

export const setTryAgain = (isDisabled) => {
  elements.tryAgain.disabled = isDisabled
  elements.tryAgain.style.cursor = isDisabled ? 'not-allowed' : 'pointer'
}

export const updateScore = (score, maxScore) => {
  elements.scoreDisplay.innerText = `${score} / ${maxScore}`
}

export const updateStats = (mistakes, accuracy, wpm, cpm, completionPercentage) => {
  elements.mistakeCount.innerText = mistakes
  elements.accuracyDisplay.innerText = `${accuracy}%`
  elements.progressFill.style.width = `${completionPercentage}%`
}

export const showResults = (gameState) => {
  document.querySelector('.result-details').classList.add('hidden')
  elements.alertCard.classList.remove('hidden')

  elements.finalScoreDisplay.innerText = `${gameState.score} / ${gameState.maxScore}` 
  elements.finalMistakesDisplay.innerText = elements.mistakeCount.innerText
  elements.finalAccuracyDisplay.innerText = elements.accuracyDisplay.innerText
  elements.finalWpmDisplay.innerText = gameState.lastWpm || 0
  elements.finalCpmDisplay.innerText = gameState.lastCpm || 0
  document.querySelector('#final-completion').innerText = `${gameState.completionPercentage}%`

  const elapsed = gameState.timeMax - gameState.timeLeft
  document.querySelector('#final-elapsed').innerText = `${elapsed} sec.`
  document.querySelector('#final-time').innerText = `${gameState.timeLeft} sec.`
}

export const updateTimeSelectorState = (isDisabled) => {
  const container = document.querySelector('.horizontal-time-dropdown');
  if (container) {
    if (isDisabled) {
      container.classList.add('disabled');
      container.setAttribute('title', 'Cannot change time during game');
      container.classList.remove('open');
      const options = container.querySelector('.time-options');
      if (options) options.classList.add('hidden');
    } else {
      container.classList.remove('disabled');
      container.setAttribute('title', 'Select time');
    }
  }
}

export const updateModeSelectorState = (isDisabled) => {
  const container = document.querySelector('.horizontal-mode-dropdown')
  if (container) {
    if (isDisabled) {
      container.classList.add('disabled')
      container.setAttribute('title', 'Cannot change mode during game')
      container.classList.remove('open')
      const options = container.querySelector('.mode-options')
      if (options) options.classList.add('hidden')
    } else {
      container.classList.remove('disabled')
      container.setAttribute('title', 'Select mode')
    }
  }
}

export const setupDragHandlers = () => {
  const dragAlert = (event) => {
    if (isDraggingAlert) {
      const newX = event.clientX - initialAlertX
      const newY = event.clientY - initialAlertY
      elements.draggable.style.left = `${newX}px`
      elements.draggable.style.top = `${newY}px`
    }
  }

  const stopDragAlert = () => {
    isDraggingAlert = false
    document.removeEventListener('mousemove', dragAlert)
    document.removeEventListener('mouseup', stopDragAlert)
  }

  if (elements.draggable) {
    elements.draggable.addEventListener('mousedown', (event) => {
      isDraggingAlert = true
      event.preventDefault()
      initialAlertX = event.clientX - elements.draggable.offsetLeft
      initialAlertY = event.clientY - elements.draggable.offsetTop
      document.addEventListener('mousemove', dragAlert)
      document.addEventListener('mouseup', stopDragAlert)
    })
  }
}

export const setupHorizontalTimeDropdown = () => {
  const container = document.querySelector('.horizontal-time-dropdown');
  if (!container) return;

  const icon = container.querySelector('.time-icon');
  const options = container.querySelector('.time-options');

  const isGameActive = () => gameState.isTyping;

  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isGameActive()) {
      return; 
    }
    container.classList.toggle('open');
    options.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
      options.classList.add('hidden');
    }
  });

  options.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', () => {
      if (isGameActive()) {
        return; 
      }
      
      const value = span.getAttribute('data-time');
      
      if (!value) return;

      gameState.timeMax = parseInt(value);
      gameState.timeLeft = gameState.timeMax;
      
      gameState.calculateTimeMultiplier();
      const paragraphLength = elements.textDisplay.querySelectorAll('span').length;
      if (paragraphLength > 0) {
        gameState.maxScore = Math.ceil(paragraphLength * gameState.timeMultiplier);
        updateScore(gameState.score, gameState.maxScore);
      }
      
      const timeDisplay = document.querySelector('.time span b');
      if (timeDisplay) timeDisplay.innerText = gameState.timeLeft;

      setTimeSelectionVisible(false);
      if (elements.inputIndicator) elements.inputIndicator.classList.add('ready')
      setInputDisabled(false);
      setTryAgain(false);
      elements.input.focus();
      
      container.classList.remove('open');
      options.classList.add('hidden');
    });
  });
};

export const setupHorizontalModeDropdown = () => {
  const container = document.querySelector('.horizontal-mode-dropdown')
  if (!container) return

  const icon = container.querySelector('.mode-icon')
  const options = container.querySelector('.mode-options')

  const isGameActive = () => gameState.isTyping

  const saved = localStorage.getItem('gameMode') || 'phrases'
  gameState.gameMode = saved
  options.querySelectorAll('span').forEach(s => {
    s.classList.toggle('active', s.getAttribute('data-mode') === saved)
  })

  icon.addEventListener('click', (e) => {
    e.stopPropagation()
    if (isGameActive()) return
    container.classList.toggle('open')
    options.classList.toggle('hidden')
  })

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open')
      options.classList.add('hidden')
    }
  })

  options.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', () => {
      if (isGameActive()) return
      const mode = span.getAttribute('data-mode')
      if (!mode) return
      gameState.gameMode = mode
      localStorage.setItem('gameMode', mode)
      options.querySelectorAll('span').forEach(s => s.classList.remove('active'))
      span.classList.add('active')
      const wc = document.querySelector('.horizontal-wordcount-dropdown')
      if (wc) {
        if (mode === 'words') wc.classList.remove('control-hidden')
        else wc.classList.add('control-hidden')
      }
      if (mode !== 'words') {
        gameState.wordsBaseParagraphIndex = null
      }
      if (typeof window.resetGame === 'function') {
        window.resetGame()
      }
      container.classList.remove('open')
      options.classList.add('hidden')
    })
  })
}

export const setupHorizontalWordCountDropdown = () => {
  const container = document.querySelector('.horizontal-wordcount-dropdown')
  if (!container) return
  const icon = container.querySelector('.wordcount-icon')
  const options = container.querySelector('.wordcount-options')

  const isGameActive = () => gameState.isTyping

  const savedCount = parseInt(localStorage.getItem('wordCount') || '50', 10)
  gameState.wordCount = isNaN(savedCount) ? 50 : savedCount
  options.querySelectorAll('span').forEach(s => {
    s.classList.toggle('active', parseInt(s.getAttribute('data-count'), 10) === gameState.wordCount)
  })

  if (gameState.gameMode === 'words') container.classList.remove('control-hidden')
  else container.classList.add('control-hidden')

  icon.addEventListener('click', (e) => {
    e.stopPropagation()
    if (isGameActive()) return
    container.classList.toggle('open')
    options.classList.toggle('hidden')
  })

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open')
      options.classList.add('hidden')
    }
  })

  options.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', () => {
      if (isGameActive()) return
      const count = parseInt(span.getAttribute('data-count'), 10)
      if (!count) return
      gameState.wordCount = count
      localStorage.setItem('wordCount', String(count))
      options.querySelectorAll('span').forEach(s => s.classList.remove('active'))
      span.classList.add('active')
      gameState.preserveWordsBase = true
      if (typeof window.resetGame === 'function') window.resetGame()
      if (gameState.gameMode === 'words') {
        const wordSpans = Array.from(options.querySelectorAll('span'))
        const idx = wordSpans.indexOf(span)
        const timeContainer = document.querySelector('.horizontal-time-dropdown')
        const timeSpans = timeContainer ? Array.from(timeContainer.querySelectorAll('.time-options span')) : []
        const timeSpan = timeSpans[idx] || timeSpans[0]
        if (timeSpan) {
          const t = parseInt(timeSpan.getAttribute('data-time'), 10)
          if (!Number.isNaN(t)) {
            gameState.timeMax = t
            gameState.timeLeft = t
            const timeDisplay = document.querySelector('.time span b')
            if (timeDisplay) timeDisplay.innerText = t
            setTimeSelectionVisible(false)
            if (elements.inputIndicator) elements.inputIndicator.classList.add('ready')
            setInputDisabled(false)
            setTryAgain(false)
            elements.input.focus()
          }
        }
      }
      container.classList.remove('open')
      options.classList.add('hidden')
    })
  })
}

if (elements.input && elements.inputIndicator) {
  elements.inputIndicator.addEventListener('click', () => {
    if (!elements.input.disabled) {
      elements.input.focus();
    }
  });

  elements.input.addEventListener('focus', () => {
    elements.inputIndicator.classList.add('focused');
    if (elements.hotkeyHint) elements.hotkeyHint.classList.add('hidden')
  });

  elements.input.addEventListener('blur', () => {
    elements.inputIndicator.classList.remove('focused');
    if (elements.hotkeyHint) elements.hotkeyHint.classList.remove('hidden')
  });

  elements.input.addEventListener('input', () => {
    elements.inputIndicator.classList.add('game-started');
  }, { once: false });
}

export const resetInputHint = () => {
  if (elements.inputIndicator) {
    elements.inputIndicator.classList.remove('game-started');
    elements.inputIndicator.classList.remove('ready');
  }
}