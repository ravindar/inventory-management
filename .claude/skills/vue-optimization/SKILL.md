---
name: vue-optimization
description: Analyze Vue component structure and suggest performance optimizations and code reuse opportunities
---

# Vue Component Optimization Skill

This skill analyzes Vue 3 components and provides actionable recommendations for performance improvements and code reuse opportunities.

## Overview

The skill identifies:
- **Performance Issues**: Unnecessary watchers, inefficient computed properties, missing memoization
- **Code Reuse**: Duplicate logic that should be extracted into composables
- **Lifecycle Optimization**: Inefficient hook usage and event listener cleanup
- **Reactivity Issues**: Potential reactivity traps and unnecessary re-renders
- **Component Architecture**: Props drilling, prop validation, slot usage patterns

## Analysis Categories

### 1. Performance Optimization

#### Computed Properties
- ✅ **Good**: Cached, auto-tracks dependencies
```js
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

- ❌ **Issue**: Method called repeatedly (no caching)
```js
const getFullName = () => `${firstName.value} ${lastName.value}`
// Called multiple times in template: {{ getFullName() }}
```

**Suggestion**: Convert methods to computed properties if they're called in templates frequently

#### Watchers
- ✅ **Good**: Only watch when necessary, immediate flag when needed
```js
watch(userId, (newId) => {
  fetchUserData(newId)
}, { immediate: true })
```

- ❌ **Issue**: Watching multiple simple values individually
```js
watch(firstName, updateFullName)
watch(lastName, updateFullName)
watch(email, validateEmail)
```

**Suggestion**: Combine related watchers, use watchEffect for computed dependencies

#### Event Listeners & Cleanup
- ✅ **Good**: Listeners added and removed
```js
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

- ❌ **Issue**: Event listeners added but never removed (memory leak)
```js
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // Missing onUnmounted cleanup
})
```

**Suggestion**: Always cleanup event listeners, timers, and subscriptions

### 2. Code Reuse & Composables

#### Extract Common Logic
- ✅ **Good**: Reusable composable
```js
// composables/useFormValidation.js
export function useFormValidation(schema) {
  const errors = ref({})
  const validate = (data) => { /* validation logic */ }
  return { errors, validate }
}
```

- ❌ **Issue**: Validation logic duplicated across components
```js
// Component A
const errors = ref({})
const validate = () => { /* validation logic */ }

// Component B
const errors = ref({})
const validate = () => { /* same validation logic */ }
```

**Suggestion**: Extract to `composables/useFormValidation.js`

#### Props Drilling
- ✅ **Good**: Use provide/inject or slots
```js
// Parent
provide('theme', theme)

// Child
const theme = inject('theme')
```

- ❌ **Issue**: Props passed through multiple levels
```
<Parent :user="user" :theme="theme" :settings="settings">
  <Child :user="user" :theme="theme" :settings="settings">
    <GrandChild :user="user" :theme="theme" :settings="settings" />
  </Child>
</Parent>
```

**Suggestion**: Use provide/inject for deeply nested data

### 3. Reactivity Issues

#### Array/Object Mutations
- ✅ **Good**: Proper reactivity with spread operator
```js
const addItem = (item) => {
  items.value = [...items.value, item]
}

const updateItem = (index, data) => {
  items.value[index] = { ...items.value[index], ...data }
}
```

- ❌ **Issue**: Direct mutations that Vue can't track
```js
const addItem = (item) => {
  items.value.push(item) // Works but inconsistent
}

const updateItem = (index, data) => {
  Object.assign(items.value[index], data) // Vue may miss this
}
```

**Suggestion**: Use assignment operators for consistency

#### Ref vs Reactive
- ✅ **Good**: Use ref for primitives, reactive for objects
```js
const count = ref(0)
const user = reactive({ name: '', age: 0 })
```

- ❌ **Issue**: Reactive for simple values (destructuring issues)
```js
const state = reactive({ count: 0, loading: false })
// Destructuring loses reactivity
const { count, loading } = state
```

**Suggestion**: Use ref for primitives, keep reactive objects intact

### 4. Component Structure

#### Prop Validation
- ✅ **Good**: Comprehensive prop definitions
```js
const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (value) => value.id && value.name
  },
  status: {
    type: String,
    default: 'pending',
    validator: (value) => ['pending', 'active', 'archived'].includes(value)
  }
})
```

- ❌ **Issue**: No prop validation
```js
const props = defineProps(['user', 'status'])
```

**Suggestion**: Add type definitions and validators

#### Slot Usage
- ✅ **Good**: Named slots for flexibility
```js
<slot name="header" :title="title" />
<slot />
<slot name="footer" />
```

- ❌ **Issue**: Multiple children that should be slots
```js
<div>
  <h1>{{ title }}</h1>
  <div>{{ content }}</div>
  <footer>{{ footer }}</footer>
</div>
```

**Suggestion**: Use slots for customizable sections

### 5. Template Optimization

#### v-if vs v-show
- ✅ **Good**: v-if for infrequently toggled content
```js
<Modal v-if="isOpen" @close="isOpen = false" />
```

- ❌ **Issue**: v-show for frequently toggled (extra hidden elements)
```js
<div v-show="isVisible">Heavy content</div>
```

**Suggestion**: Use v-if for modals, dialogs; v-show for toggles

#### Key in v-for
- ✅ **Good**: Unique identifier as key
```js
<div v-for="item in items" :key="item.id">{{ item.name }}</div>
```

- ❌ **Issue**: Index or no key (reordering issues)
```js
<div v-for="(item, index) in items" :key="index">{{ item.name }}</div>
```

**Suggestion**: Use unique identifiers (id, uuid) not index

## Optimization Patterns

### Pattern 1: Extract Composable
**Issue**: Multiple components need same logic
```js
// Before: Duplicated in 3 components
const [data, loading, error] = useFetch(url)
```

**Solution**:
```js
// composables/useFetchData.js
export function useFetchData(url) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  onMounted(async () => {
    loading.value = true
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })
  
  return { data, loading, error }
}
```

### Pattern 2: Combine Watchers
**Issue**: Multiple watchers on related data
```js
watch(firstName, updateForm)
watch(lastName, updateForm)
watch(email, updateForm)
```

**Solution**:
```js
watchEffect(() => {
  updateForm({ firstName, lastName, email })
})

// Or for explicit control:
watch([firstName, lastName, email], updateForm)
```

### Pattern 3: Event Listener Cleanup
**Issue**: Memory leaks from missing cleanup
```js
onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClick)
})
```

**Solution**:
```js
onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClick)
})
```

### Pattern 4: Eliminate Props Drilling
**Issue**: Props passed through multiple levels
```
Parent → Child → GrandChild → GreatGrandChild
```

**Solution** (provide/inject):
```js
// Parent
provide('userData', userData)

// GrandChild (skip Child)
const userData = inject('userData')
```

### Pattern 5: Memoized Computed
**Issue**: Expensive computation runs every render
```js
const expensiveValue = computed(() => {
  return veryExpensiveCalculation()
})
```

**Solution** (already memoized in Vue 3):
```js
const expensiveValue = computed(() => {
  return veryExpensiveCalculation()
})
// Vue 3 automatically caches based on dependency changes
```

## Usage

### Analyze a Single Component
```bash
/vue-optimization client/src/views/Inventory.vue
```

### Analyze Multiple Components
```bash
/vue-optimization client/src/components/*.vue
```

### Analyze with Specific Focus
```bash
/vue-optimization --focus performance client/src/
/vue-optimization --focus reuse client/src/
/vue-optimization --focus reactivity client/src/
```

## Output Format

The skill provides:

1. **Summary**
   - Component name and size
   - Number of issues found
   - Performance impact assessment

2. **Issues (by category)**
   - Description of the issue
   - Location (line number if applicable)
   - Severity: Critical | Warning | Info
   - Current code snippet
   - Recommended fix

3. **Opportunities**
   - Code that could be extracted to composables
   - Patterns that match other components
   - Potential performance gains

4. **Score**
   - Performance: 0-100
   - Code Reuse: 0-100
   - Reactivity: 0-100
   - Overall: 0-100

## Common Optimization Wins

### Memory Reduction
- Remove unused event listeners: **5-15% memory reduction**
- Extract duplicate composables: **10-20% code reduction**
- Use v-if instead of v-show: **Conditional 20-50% reduction**

### Runtime Performance
- Convert methods to computed: **2-5x faster in high-frequency templates**
- Combine watchers: **Fewer watcher callbacks, 10-30% reduction**
- Add proper keys to v-for: **Reordering 50-80% faster**

### Bundle Size
- Extract composables: **3-8KB reduction per extracted logic**
- Remove unnecessary props validation: **Minimal impact but cleaner**
- Use slots instead of props: **Smaller prop surface area**

## Best Practices Checklist

- [ ] All props have type definitions
- [ ] All event listeners are cleaned up
- [ ] No memory leaks from subscriptions
- [ ] Watchers are minimal and specific
- [ ] Computed properties used instead of methods
- [ ] No props drilling beyond 2 levels
- [ ] Keys in v-for are unique identifiers
- [ ] Slots used for customizable sections
- [ ] Common logic extracted to composables
- [ ] No mutations in computed getters
- [ ] Reactive objects not destructured
- [ ] No unnecessary watchers on computed values

## Performance Metrics to Monitor

Track these with DevTools Profiler:
- **Render time**: Should be <16.7ms for 60fps
- **Component updates**: Should only update when dependencies change
- **Memory**: Should not grow over time (no leaks)
- **Watchers**: Should minimize callback frequency

## Limitations & Edge Cases

- Async setup() is detected but flagged (use Suspense instead)
- Template-only components can't be analyzed statically
- Style scoping issues are out of scope
- TypeScript types aren't deeply analyzed
- Custom lifecycle hooks aren't recognized
- Plugin usage patterns aren't validated

## Integration with CLAUDE.md

This skill works with your existing code guidelines:
- Focuses on performance without over-engineering
- Suggests only non-obvious optimizations
- Respects your "no premature abstraction" principle
- Identifies true performance gains (3+ items, repeated patterns)

## Related Skills

- `/saas-ui-redesign` — Update UI with optimized components
- `/code-review` — General code quality review
- `/simplify` — Simplification of logic (complementary)

## Examples

### Example 1: Performance Issues
```vue
<!-- BEFORE: Multiple issues -->
<script setup>
const items = ref([])
const filtered = () => items.value.filter(i => i.active)

watch(query, () => {
  search()
})
watch(filter, () => {
  search()
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
</script>
```

**Issues Found:**
- ❌ `filtered()` method should be computed (called in template)
- ❌ Multiple related watchers (combine with watchEffect)
- ❌ Event listener never cleaned up

**After Optimization:**
```vue
<script setup>
const items = ref([])
const filtered = computed(() => items.value.filter(i => i.active))

watchEffect(() => {
  search() // Auto-tracks query and filter
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

### Example 2: Code Reuse
```vue
<!-- BEFORE: Duplicated in 5 components -->
<script setup>
const errors = ref({})
const isValid = computed(() => Object.keys(errors).length === 0)

const validate = (data) => {
  errors.value = {}
  if (!data.email) errors.value.email = 'Required'
  if (!data.name) errors.value.name = 'Required'
  return isValid.value
}
</script>
```

**Suggestion**: Extract to `composables/useFormValidation.js`

**After Extraction:**
```js
// composables/useFormValidation.js
export function useFormValidation(schema) {
  const errors = ref({})
  const isValid = computed(() => Object.keys(errors).length === 0)
  
  const validate = (data) => {
    errors.value = {}
    schema.forEach(field => {
      if (!data[field.name]) {
        errors.value[field.name] = 'Required'
      }
    })
    return isValid.value
  }
  
  return { errors, isValid, validate }
}
```

```vue
<!-- Components now use composable -->
<script setup>
const { errors, isValid, validate } = useFormValidation(schema)
</script>
```

## FAQ

**Q: Should I optimize every component?**
A: No. Optimize bottlenecks first. Profile with DevTools, then optimize.

**Q: Will these changes break my app?**
A: No. All suggestions maintain the same behavior.

**Q: Can this detect style scoping issues?**
A: No, that's beyond the scope. Use CSS modules or BEM naming.

**Q: What about TypeScript?**
A: The skill works with TS components. Deep type analysis not included.

**Q: How often should I run this?**
A: When adding new features or refactoring. Quarterly review of codebase.

