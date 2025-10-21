// ui.js
import { gameState } from './game.js' 

// DOM Elements
export const elements = {
  textDisplay: document.querySelector('.typing-text p'),
  input: document.querySelector('.top-controls .input-field'),
  // New: Input indicator element
  inputIndicator: document.querySelector('.input-indicator'),
  mistakeCount: document.querySelector('.mistake span'),
  accuracyDisplay: document.querySelector('.accuracy span'),
  timeDisplay: document.querySelector('.time span b'),
  wpmDisplay: document.querySelector('.wpm span'),
  cpmDisplay: document.querySelector('.cpm span'),
  // Removed timeDropdown element reference
  tryAgain: document.querySelector('.content button'),
  scoreDisplay: document.querySelector('.score-container #score'),
  alertCard: document.querySelector('.alert-card'),
  finalScoreDisplay: document.querySelector('#final-score'),
  finalMistakesDisplay: document.querySelector('#final-mistakes'),
  finalAccuracyDisplay: document.querySelector('#final-accuracy'),
  finalWpmDisplay: document.querySelector('#final-wpm'),
  finalCpmDisplay: document.querySelector('#final-cpm'),
  closeAlertButton: document.querySelector('#close-alert'),
  completionDisplay: document.querySelector('#completion'),
  themeToggle: document.querySelector('#theme-toggle'),
  draggable: document.querySelector('.draggable'),
  wrapper: document.querySelector('.wrapper')
}

// UI State
let initialAlertX = 0
let initialAlertY = 0
let isDraggingAlert = false

// UI Functions
export const setTimeSelectionVisible = (showSelector = true) => {
  // If a header time dropdown exists, toggle it; otherwise fallback to hidden select
  const headerDropdown = document.querySelector('.time-dropdown')
  
  // Logic simplified, removed reference to hidden select
  if (headerDropdown) {
    headerDropdown.style.display = showSelector ? 'inline-flex' : 'none'
  }

  const timeDisplay = document.querySelector('.time')
  if (timeDisplay) {
    timeDisplay.style.display = showSelector ? 'none' : 'block'
  }
}

export const setInputDisabled = (isDisabled) => {
  elements.input.disabled = isDisabled
  // elements.input.style.cursor = isDisabled ? 'not-allowed' : 'auto' // Removed since input is hidden
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
  elements.wpmDisplay.innerText = wpm
  elements.cpmDisplay.innerText = cpm
  elements.completionDisplay.innerText = `${completionPercentage}%`
}

export const showResults = (gameState) => {
  document.querySelector('.result-details').classList.add('hidden')
  elements.alertCard.classList.remove('hidden')

  // Display stats
  elements.finalScoreDisplay.innerText = `${gameState.score} / ${gameState.maxScore}` 
  elements.finalMistakesDisplay.innerText = elements.mistakeCount.innerText
  elements.finalAccuracyDisplay.innerText = elements.accuracyDisplay.innerText
  elements.finalWpmDisplay.innerText = elements.wpmDisplay.innerText
  elements.finalCpmDisplay.innerText = elements.cpmDisplay.innerText
  document.querySelector('#final-completion').innerText = `${gameState.completionPercentage}%`

  // Time calculations
  const elapsed = gameState.timeMax - gameState.timeLeft
  document.querySelector('#final-elapsed').innerText = `${elapsed} sec.`
  document.querySelector('#final-time').innerText = `${gameState.timeLeft} sec.`

  // Removed hidden select reference: if (elements.timeDropdown) elements.timeDropdown.selectedIndex = 0
}

export const updateTimeSelectorState = (isDisabled) => {
  const container = document.querySelector('.horizontal-time-dropdown');
  if (container) {
    if (isDisabled) {
      container.classList.add('disabled');
      container.setAttribute('title', 'Cannot change time during game');
      // Ensure it is closed
      container.classList.remove('open');
      const options = container.querySelector('.time-options');
      if (options) options.classList.add('hidden');
    } else {
      container.classList.remove('disabled');
      container.setAttribute('title', 'Select time');
    }
  }
}

// Drag functionality
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

// Removed setupTimeDropdown since the hidden select is gone

// 🕒 Horizontal expanding time dropdown setup
export const setupHorizontalTimeDropdown = () => {
  const container = document.querySelector('.horizontal-time-dropdown');
  if (!container) return;

  const icon = container.querySelector('.time-icon');
  const options = container.querySelector('.time-options');
  // Removed hiddenSelect reference

  // Helper function to check if the game is active
  const isGameActive = () => gameState.isTyping || (gameState.timeLeft < gameState.timeMax && gameState.timeMax > 0);

  // Toggle open/close
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    // PREVENT TOGGLE IF GAME IS ACTIVE
    if (isGameActive()) {
      return; 
    }
    container.classList.toggle('open');
    options.classList.toggle('hidden');
  });

  // Close if clicked elsewhere
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
      options.classList.add('hidden');
    }
  });

  // Handle time selection
  options.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', () => {
      // PREVENT SELECTION IF GAME IS ACTIVE
      if (isGameActive()) {
        return; 
      }
      
      const value = span.getAttribute('data-time');
      
      // NEW LOGIC: Directly update gameState and UI
      if (!value) return;

      gameState.timeMax = parseInt(value);
      gameState.timeLeft = gameState.timeMax;
      
      const timeDisplay = document.querySelector('.time span b');
      if (timeDisplay) timeDisplay.innerText = gameState.timeLeft;

      setTimeSelectionVisible(false); // Hide selector, show time display (if applicable)
      setInputDisabled(false);
      setTryAgain(false);
      elements.input.focus();
      
      // Close the dropdown after selection
      container.classList.remove('open');
      options.classList.add('hidden');
    });
  });
};


// Focus indicator logic for the new icon
if (elements.input && elements.inputIndicator) {
  // Focus the hidden input when the user clicks on the indicator
  elements.inputIndicator.addEventListener('click', () => {
    // Only allow focusing if the input is not disabled (i.e., time has been selected)
    if (!elements.input.disabled) {
      elements.input.focus();
    }
  });

  // Change indicator color on focus
  elements.input.addEventListener('focus', () => {
    elements.inputIndicator.classList.add('focused');
  });

  // Change indicator color on blur
  elements.input.addEventListener('blur', () => {
    elements.inputIndicator.classList.remove('focused');
  });
}