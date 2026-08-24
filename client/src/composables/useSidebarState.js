import { ref, computed } from 'vue'

// Shared sidebar state (singleton pattern, same approach as useFilters)
const SIDEBAR_WIDTH = 250
const SIDEBAR_COLLAPSED_WIDTH = 70

const isCollapsed = ref(false)

// Mobile drawer open/closed state (independent from desktop collapse state)
const isMobileOpen = ref(false)

export function useSidebarState() {
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  const toggleMobileSidebar = () => {
    isMobileOpen.value = !isMobileOpen.value
  }

  const closeMobileSidebar = () => {
    isMobileOpen.value = false
  }

  const sidebarWidth = computed(() => {
    return isCollapsed.value ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`
  })

  return {
    isCollapsed,
    toggleSidebar,
    sidebarWidth,
    isMobileOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
    SIDEBAR_WIDTH,
    SIDEBAR_COLLAPSED_WIDTH
  }
}
