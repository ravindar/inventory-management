import { ref, computed, watch } from 'vue'

// Shared dark mode state (singleton pattern)
const isDarkMode = ref(localStorage.getItem('dark-mode') === 'true')

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  const enableDarkMode = () => {
    isDarkMode.value = true
  }

  const disableDarkMode = () => {
    isDarkMode.value = false
  }

  // Watch for changes and persist to localStorage
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('dark-mode', newValue)
    // Update document attribute for CSS variable switching
    if (newValue) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, { immediate: true })

  return {
    isDarkMode,
    toggleDarkMode,
    enableDarkMode,
    disableDarkMode
  }
}
