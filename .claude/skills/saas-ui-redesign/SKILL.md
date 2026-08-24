---
name: saas-ui-redesign
description: Redesign Vue 3 application into a modern SaaS-style interface with vertical sidebar navigation, consistent spacing, and polished professional styling
---

# SaaS UI Redesign Skill

This skill transforms the Factory Inventory Management System into a modern, professional SaaS-style interface featuring a sleek left sidebar navigation, consistent spacing, and refined visual design.

## Overview

The redesign implements a three-phase transformation:
1. **Navigation Architecture** — Replace top navbar with left sidebar, add collapsible menu
2. **Layout System** — Implement consistent spacing, grid structure, and responsive behavior
3. **Visual Polish** — Apply refined colors, shadows, typography, and hover states

## Design Principles

### 1. Sidebar Navigation (Left-aligned)

**Structure:**
- Fixed left sidebar (250px width, collapsible to 70px icon-only mode)
- Smooth collapse/expand animation
- Active route indicator
- User profile section at top
- Logout at bottom

**Features:**
- High contrast icons with text labels
- Hover states showing full path on collapsed state
- Smooth transitions
- Mobile responsive (sidebar becomes drawer)

### 2. Spacing & Alignment System

**Base Unit:** `1rem = 16px`

- Page padding: `2rem` (32px)
- Section spacing: `1.5rem` (24px)
- Component spacing: `1rem` (16px)
- Element gaps: `0.5rem` (8px)

**Responsive Breakpoints:**
- Desktop: Sidebar visible
- Tablet (768px): Collapsible sidebar
- Mobile (<640px): Drawer/hamburger menu

### 3. Visual Design System

**Colors:**
- Primary: `#0f172a` (Dark slate for headers)
- Secondary: `#64748b` (Gray for text)
- Accent: `#3b82f6` (Blue for interactions)
- Success: `#22c55e` (Green for status)
- Background: `#f8fafc` (Soft white)

**Shadows:**
- Light: `0 1px 2px rgba(0,0,0,0.05)`
- Medium: `0 4px 6px rgba(0,0,0,0.1)`
- Elevated: `0 10px 20px rgba(0,0,0,0.15)`

**Typography:**
- Headings: 600+ weight, -0.02em letter-spacing
- Body: 400-500 weight, line-height 1.6
- Mono: `Courier New, monospace` for code

### 4. Component Updates

**Cards:**
- White background with subtle border (`1px solid #e2e8f0`)
- Rounded corners (`8px`)
- Consistent padding (`1.5rem`)
- Hover elevation on interactive cards

**Buttons:**
- Primary: Solid blue with white text, rounded corners
- Secondary: White with border, gray text
- Tertiary: Transparent with gray text, hover background
- Disabled: Reduced opacity, no hover effects

**Forms:**
- Input height: `40px` (10 + 10 + 20)
- Padding: `0.5rem 0.75rem`
- Border: `1px solid #cbd5e1`
- Focus: `2px solid #3b82f6`
- Border radius: `6px`

**Tables:**
- Header background: `#0f172a` with white text
- Row hover: `#f1f5f9` background
- Borders: `1px solid #e2e8f0`
- Cell padding: `0.75rem 1rem`

## Implementation Strategy

### Phase 1: Layout Foundation
1. Create `SidebarLayout.vue` — Main layout component
2. Update `App.vue` — Remove top navbar, integrate sidebar
3. Create `Sidebar.vue` — Navigation component with collapse
4. Update global styles — Implement spacing system

### Phase 2: Component Migration
1. Update all views to work with new sidebar layout
2. Refactor FilterBar placement (top of content area)
3. Apply consistent card/spacing to all views
4. Update button and form styling

### Phase 3: Visual Polish
1. Add hover states and transitions
2. Implement active route styling
3. Refine shadows and depth
4. Add responsive breakpoints

## File Modifications

### New Files
```
client/src/
├── layouts/
│   ├── SidebarLayout.vue      # Main layout wrapper
│   └── sidebar-layout.css     # Layout styles
├── components/
│   └── Sidebar.vue            # Left sidebar navigation
└── composables/
    └── useSidebarState.js     # Collapse/expand state
```

### Modified Files
```
client/src/
├── App.vue                    # Remove top nav, add sidebar
├── main.js                    # No changes (routing stays same)
├── views/
│   ├── Dashboard.vue          # Apply new spacing/styling
│   ├── Inventory.vue          # Apply new spacing/styling
│   ├── Orders.vue             # Apply new spacing/styling
│   ├── Demand.vue             # Apply new spacing/styling
│   ├── Spending.vue           # Apply new spacing/styling
│   ├── Reports.vue            # Apply new spacing/styling
│   └── Restocking.vue         # Apply new spacing/styling
└── App.vue (global styles)    # Update color palette, spacing
```

## Navigation Menu Structure

```
Sidebar Navigation:
├── Logo / Brand
├── Dashboard       [Icon: bar-chart]
├── Inventory       [Icon: package]
├── Orders          [Icon: inbox]
├── Demand          [Icon: trending-up]
├── Spending        [Icon: wallet]
├── Reports         [Icon: file-text]
└── Restocking      [Icon: refresh-cw]
├── ─────────────────
├── Logout          [Icon: log-out]
```

## Styling Standards

### Sidebar
- Background: `#f8fafc` (light gray)
- Border-right: `1px solid #e2e8f0`
- Icon size: `24px`
- Text size: `0.95rem`
- Hover background: `#e2e8f0`
- Active text: `#3b82f6` (bold)
- Transition: `width 0.3s ease`

### Main Content Area
- Background: `#ffffff` or `#f8fafc`
- Padding: `2rem`
- Max-width: Unlimited (expand with sidebar)

### FilterBar Position
- Moved from sticky top-nav to content area
- Below title, above data tables
- Sticky within content (not global)

## Responsive Behavior

### Desktop (>1024px)
- Sidebar visible, width 250px
- Content takes remaining space
- Sidebar can be collapsed via toggle

### Tablet (768-1024px)
- Sidebar 70px (icon-only) by default
- Hover shows full labels (tooltip-like)
- Expand button for full sidebar overlay

### Mobile (<768px)
- Sidebar becomes full-height drawer
- Hamburger menu icon in header
- Drawer overlays content with semi-transparent background
- Content padding: 1.5rem

## Animation & Transitions

**Sidebar Collapse:**
- Duration: 0.3s
- Easing: `ease-in-out`
- Icon rotation on menu items

**Hover States:**
- Card hover: Scale 0.5%, shadow elevation
- Button hover: Slight color darken, cursor pointer
- Navigation hover: Background color shift

**Loading States:**
- Skeleton loaders for data tables
- Spinner overlay for API calls
- Disable button during submission

## Accessibility

- Semantic HTML (nav, main, aside, section)
- Proper heading hierarchy (h1 → h6)
- ARIA labels on icon buttons
- Focus ring on keyboard navigation
- Color contrast ratio ≥ 4.5:1

## Migration Checklist

- [ ] Create SidebarLayout and Sidebar components
- [ ] Update App.vue to use new layout
- [ ] Apply spacing system to all views
- [ ] Update button and form styling
- [ ] Test responsive breakpoints
- [ ] Verify navigation active states
- [ ] Add hover and transition effects
- [ ] Test accessibility with keyboard nav
- [ ] Update color palette throughout
- [ ] Test on mobile devices

## Performance Notes

- Sidebar collapse animation uses CSS transitions (GPU-accelerated)
- No JavaScript animation repaints
- Sidebar state stored in lightweight composable
- Responsive styles use CSS media queries (not JS)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- CSS Variables for theme customization
- No polyfills needed

## Usage

When you're ready to apply this redesign:

```bash
# Invoke the redesign (auto-applies changes)
/saas-ui-redesign

# Or with preview mode (if available)
/saas-ui-redesign --preview
```

The skill will:
1. Analyze current components and layout
2. Create new sidebar navigation
3. Update all views with consistent spacing
4. Apply visual polish and styling
5. Test build and verify no errors
6. Display before/after comparison

## Post-Redesign Customization

After the redesign is applied, you can customize:

**Theme Colors** — Update CSS variables in `App.vue`:
```css
:root {
  --color-primary: #0f172a;
  --color-accent: #3b82f6;
  --color-success: #22c55e;
  --color-background: #f8fafc;
}
```

**Sidebar Width** — Modify in `Sidebar.vue`:
```js
const SIDEBAR_WIDTH = 250; // pixels
const SIDEBAR_COLLAPSED = 70; // pixels
```

**Spacing Scale** — Update in global CSS:
```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

## Support

This skill creates a modern SaaS interface while maintaining all existing functionality. No features are removed, only redesigned for a more professional appearance.
