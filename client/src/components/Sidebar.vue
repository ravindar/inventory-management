<template>
  <div class="sidebar-backdrop" v-if="isMobileOpen" @click="closeMobileSidebar"></div>
  <aside
    class="sidebar"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }"
    :style="{ width: sidebarWidth }"
  >
    <div class="sidebar-header">
      <div class="brand" v-if="!isCollapsed">
        <div class="brand-mark">{{ brandInitials }}</div>
        <div class="brand-text">
          <span class="brand-name">{{ t('nav.companyName') }}</span>
          <span class="brand-subtitle">{{ t('nav.subtitle') }}</span>
        </div>
      </div>
      <div class="brand collapsed-brand" v-else>
        <div class="brand-mark">{{ brandInitials }}</div>
      </div>

      <button
        class="collapse-toggle desktop-only"
        @click="toggleSidebar"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!isCollapsed"
      >
        <svg viewBox="0 0 16 16" fill="none" :class="{ rotated: isCollapsed }">
          <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button
        class="collapse-toggle mobile-only"
        @click="closeMobileSidebar"
        aria-label="Close menu"
      >
        &times;
      </button>
    </div>


    <nav class="sidebar-nav" aria-label="Primary">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        :title="isCollapsed ? item.label : ''"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label" v-if="!isCollapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button
        class="theme-toggle-btn"
        @click="toggleDarkMode"
        :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="isCollapsed ? (isDarkMode ? 'Light mode' : 'Dark mode') : ''"
      >
        <span class="nav-icon" v-html="isDarkMode ? icons.sun : icons.moon"></span>
        <span class="nav-label" v-if="!isCollapsed">{{ isDarkMode ? 'Light' : 'Dark' }}</span>
      </button>
      <button
        class="logout-btn"
        @click="handleLogout"
        :title="isCollapsed ? t('profile.logout') : ''"
      >
        <span class="nav-icon" v-html="icons.logout"></span>
        <span class="nav-label" v-if="!isCollapsed">{{ t('profile.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useI18n } from '../composables/useI18n'
import { useSidebarState } from '../composables/useSidebarState'
import { useDarkMode } from '../composables/useDarkMode'

const route = useRoute()
const { currentUser, logout, getInitials } = useAuth()
const { t } = useI18n()
const { isCollapsed, toggleSidebar, sidebarWidth, isMobileOpen, closeMobileSidebar } = useSidebarState()
const { isDarkMode, toggleDarkMode } = useDarkMode()

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10M12 20V4M20 20V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  inventory: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 8L12 3L3 8L12 13L21 8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 8V16L12 21L21 16V8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 13V21" stroke="currentColor" stroke-width="1.5"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12H7L9 15H15L17 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 4H19L21 12V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V12L5 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  demand: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 17L9 11L13 15L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7H21V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spending: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 10H21" stroke="currentColor" stroke-width="1.5"/><circle cx="16.5" cy="14.5" r="1.25" fill="currentColor"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 3H14L19 8V20C19 20.5523 18.5523 21 18 21H7C6.44772 21 6 20.5523 6 20V4C6 3.44772 6.44772 3 7 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 3V8H19" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 13H16M9 17H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  restocking: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12A9 9 0 0118.3 5.6L21 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 3V8H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12A9 9 0 015.7 18.4L3 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 21V16H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  logout: '<svg viewBox="0 0 18 18" fill="none"><path d="M7 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 12L15 9M15 9L11 6M15 9H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
}

const navItems = computed(() => [
  { path: '/', label: t('nav.overview'), icon: icons.dashboard },
  { path: '/inventory', label: t('nav.inventory'), icon: icons.inventory },
  { path: '/orders', label: t('nav.orders'), icon: icons.orders },
  { path: '/demand', label: t('nav.demandForecast'), icon: icons.demand },
  { path: '/spending', label: t('nav.finance'), icon: icons.spending },
  { path: '/reports', label: t('nav.reports'), icon: icons.reports },
  { path: '/restocking', label: t('nav.restocking'), icon: icons.restocking }
])

const brandInitials = computed(() => {
  return t('nav.companyName')
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const isActive = (path) => route.path === path

const handleLogout = () => {
  logout()
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: var(--background);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out, background-color 0.3s ease, border-color 0.3s ease;
  overflow-x: hidden;
  z-index: 200;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.collapsed-brand {
  justify-content: center;
  width: 100%;
}

.brand-mark {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-name {
  font-size: 0.938rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subtitle {
  font-size: 0.688rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-toggle:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.collapse-toggle svg {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease-in-out;
}

.collapse-toggle svg.rotated {
  transform: rotate(180deg);
}

.collapse-toggle.mobile-only {
  display: none;
  font-size: 1.25rem;
  line-height: 1;
}

.sidebar-backdrop {
  display: none;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.profile-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
}

.profile-info {
  min-width: 0;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.nav-item.active {
  color: var(--accent);
  font-weight: 700;
  background: rgba(96, 165, 250, 0.1);
}

.nav-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 1.5rem 0.75rem;
  border-top: 1px solid var(--border-color);
}

.theme-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
  margin-bottom: 0.5rem;
}

.theme-toggle-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  background: none;
  border: none;
  color: #dc2626;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #fef2f2;
}

/* Mobile: sidebar becomes a drawer */
@media (max-width: 768px) {
  .sidebar {
    width: 250px !important;
    transform: translateX(-100%);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease-in-out;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .collapse-toggle.desktop-only {
    display: none;
  }

  .collapse-toggle.mobile-only {
    display: flex;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    z-index: 190;
  }
}
</style>
