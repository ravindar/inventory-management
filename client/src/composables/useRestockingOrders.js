import { ref, computed } from 'vue'

// Shared state (singleton pattern) so Restocking.vue and Orders.vue
// see the same in-memory list of submitted restocking orders.
const submittedOrders = ref([])
let orderSequence = 0

export function useRestockingOrders() {
  // Create and store a new restocking order, returns the created order
  const addOrder = ({ items, totalValue }) => {
    orderSequence += 1

    const year = new Date().getFullYear()
    const orderNumber = `RS-${year}-${String(orderSequence).padStart(3, '0')}`

    const leadTimeDays = Math.floor(Math.random() * 6) + 2 // 2-7 days
    const orderDate = new Date()
    const expectedDelivery = new Date(orderDate)
    expectedDelivery.setDate(expectedDelivery.getDate() + leadTimeDays)

    const order = {
      id: `${Date.now()}-${orderSequence}`,
      order_number: orderNumber,
      items,
      total_value: totalValue,
      status: 'Submitted',
      order_date: orderDate.toISOString(),
      expected_delivery: expectedDelivery.toISOString(),
      lead_time_days: leadTimeDays
    }

    submittedOrders.value.unshift(order)
    return order
  }

  // Most recent first
  const sortedSubmittedOrders = computed(() => {
    return [...submittedOrders.value].sort((a, b) => {
      return new Date(b.order_date) - new Date(a.order_date)
    })
  })

  return {
    submittedOrders,
    sortedSubmittedOrders,
    addOrder
  }
}
