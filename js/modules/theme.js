import { elements } from './ui.js'

export const toggleMode = () => {
  document.addEventListener('DOMContentLoaded', () => {
    if (elements.themeToggle.checked) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  })

  elements.themeToggle.addEventListener('change', () => {
    if (elements.themeToggle.checked) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  })
}