<template>
  <div class="restocking">
    <div class="page-header">
      <h2>Restocking</h2>
      <p>Get budget-optimized reorder recommendations based on demand forecasts</p>
    </div>

    <FilterBar />

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="card budget-card">
        <div class="card-header">
          <h3 class="card-title">Restocking Budget</h3>
          <div class="budget-value">${{ budget.toLocaleString() }}</div>
        </div>
        <input
          type="range"
          min="0"
          max="50000"
          step="500"
          v-model.number="budget"
          class="budget-slider"
        />
        <div class="budget-range-labels">
          <span>$0</span>
          <span>$50,000</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Items Recommended</div>
          <div class="stat-value">{{ recommendations.length }}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">Budget Allocated</div>
          <div class="stat-value">${{ totalCost.toLocaleString() }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Budget Remaining</div>
          <div class="stat-value">${{ remainingBudget.toLocaleString() }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Units to Order</div>
          <div class="stat-value">{{ totalUnits.toLocaleString() }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recommended Items ({{ recommendations.length }})</h3>
        </div>

        <div v-if="recommendations.length === 0" class="empty-state">
          <p v-if="candidates.length === 0">
            No items currently meet reorder criteria. All stock levels are healthy.
          </p>
          <p v-else>
            No items fit within the current budget. Increase the budget slider to see recommendations.
          </p>
        </div>

        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Current Qty</th>
                <th>Reorder Point</th>
                <th>Forecasted Demand</th>
                <th>Recommended Qty</th>
                <th>Unit Cost</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recommendations" :key="item.sku">
                <td><strong>{{ item.sku }}</strong></td>
                <td>{{ item.name }}</td>
                <td>{{ item.quantity_on_hand }}</td>
                <td>{{ item.reorder_point }}</td>
                <td>
                  <strong>{{ item.forecasted_demand }}</strong>
                </td>
                <td>{{ item.recommended_qty }}</td>
                <td>${{ item.unit_cost.toFixed(2) }}</td>
                <td><strong>${{ item.line_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card action-card">
        <div class="action-summary">
          <div class="action-summary-line">
            <span>Order total:</span>
            <strong>${{ totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
          </div>
          <div class="action-summary-line">
            <span>Items:</span>
            <strong>{{ recommendations.length }} SKUs / {{ totalUnits.toLocaleString() }} units</strong>
          </div>
        </div>
        <button
          class="place-order-btn"
          :disabled="recommendations.length === 0"
          @click="placeOrder"
        >
          Place Order
        </button>
      </div>

      <div v-if="confirmation" class="confirmation-banner">
        <div class="confirmation-title">Order placed successfully</div>
        <div class="confirmation-details">
          Order <strong>{{ confirmation.order_number }}</strong> submitted for
          {{ confirmation.items.length }} item(s), total
          ${{ confirmation.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}.
          Expected delivery in {{ confirmation.lead_time_days }} days
          ({{ formatDate(confirmation.expected_delivery) }}).
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useRestockingOrders } from '../composables/useRestockingOrders'
import FilterBar from '../components/FilterBar.vue'

const { selectedLocation, selectedCategory } = useFilters()
const { addOrder } = useRestockingOrders()

const loading = ref(true)
const error = ref(null)
const inventoryItems = ref([])
const forecasts = ref([])
const budget = ref(10000)
const confirmation = ref(null)

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    const [inventoryData, forecastData] = await Promise.all([
      api.getInventory({
        warehouse: selectedLocation.value,
        category: selectedCategory.value
      }),
      api.getDemandForecasts()
    ])
    inventoryItems.value = inventoryData
    forecasts.value = forecastData
  } catch (err) {
    error.value = 'Failed to load restocking data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Items that need restocking, enriched with forecast data.
// A candidate qualifies if it is at/under its reorder point, or forecasted
// demand exceeds current stock on hand.
const candidates = computed(() => {
  const forecastBySku = new Map(forecasts.value.map(f => [f.item_sku, f]))

  const result = []
  for (const item of inventoryItems.value) {
    const forecast = forecastBySku.get(item.sku)
    if (!forecast) continue

    const needsRestock = item.quantity_on_hand <= item.reorder_point ||
      forecast.forecasted_demand > item.quantity_on_hand

    if (!needsRestock) continue

    // Target stock level: cover forecasted demand and rebuild a healthy buffer
    // above the reorder point.
    const targetQty = Math.max(item.reorder_point * 2, forecast.forecasted_demand)
    const idealQty = Math.max(Math.ceil(targetQty - item.quantity_on_hand), 0)

    if (idealQty <= 0) continue

    result.push({
      sku: item.sku,
      name: item.name,
      quantity_on_hand: item.quantity_on_hand,
      reorder_point: item.reorder_point,
      unit_cost: item.unit_cost,
      forecasted_demand: forecast.forecasted_demand,
      ideal_qty: idealQty,
      // Impact per dollar: prioritize items that satisfy the most demand per
      // dollar spent when the budget is constrained.
      impact_score: forecast.forecasted_demand / item.unit_cost
    })
  }

  return result
})

// Greedily allocate budget to the highest impact-per-dollar items first,
// then present the resulting recommendations sorted by highest demand.
const recommendations = computed(() => {
  const byImpact = [...candidates.value].sort((a, b) => b.impact_score - a.impact_score)

  let remaining = budget.value
  const allocated = []

  for (const candidate of byImpact) {
    if (remaining <= 0) break

    const maxAffordableQty = Math.floor(remaining / candidate.unit_cost)
    const recommendedQty = Math.min(candidate.ideal_qty, maxAffordableQty)

    if (recommendedQty <= 0) continue

    const lineTotal = recommendedQty * candidate.unit_cost
    remaining -= lineTotal

    allocated.push({
      ...candidate,
      recommended_qty: recommendedQty,
      line_total: lineTotal
    })
  }

  return allocated.sort((a, b) => b.forecasted_demand - a.forecasted_demand)
})

const totalCost = computed(() => {
  return recommendations.value.reduce((sum, item) => sum + item.line_total, 0)
})

const totalUnits = computed(() => {
  return recommendations.value.reduce((sum, item) => sum + item.recommended_qty, 0)
})

const remainingBudget = computed(() => {
  return Math.max(budget.value - totalCost.value, 0)
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const placeOrder = () => {
  if (recommendations.value.length === 0) return

  const items = recommendations.value.map(item => ({
    sku: item.sku,
    name: item.name,
    quantity: item.recommended_qty,
    unit_price: item.unit_cost
  }))

  const order = addOrder({ items, totalValue: totalCost.value })
  confirmation.value = order
}

watch([selectedLocation, selectedCategory], () => {
  confirmation.value = null
  loadData()
})

onMounted(loadData)
</script>

<style scoped>
.budget-card {
  padding: 1.5rem;
}

.budget-card .card-header {
  border-bottom: none;
  margin-bottom: 0.75rem;
}

.budget-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.budget-slider {
  width: 100%;
  accent-color: #22c55e;
  height: 6px;
  cursor: pointer;
}

.budget-range-labels {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.813rem;
  margin-top: 0.375rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.938rem;
}

.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.action-summary {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.action-summary-line {
  display: flex;
  gap: 0.5rem;
  font-size: 0.938rem;
  color: #334155;
}

.place-order-btn {
  background: #22c55e;
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.place-order-btn:hover:not(:disabled) {
  background: #16a34a;
}

.place-order-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.confirmation-banner {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.confirmation-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.confirmation-details {
  font-size: 0.875rem;
}
</style>
