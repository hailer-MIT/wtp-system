# Inventory Automatic Reduction & Stock Alert Testing Guide

## Overview
This guide explains how to test the inventory automatic reduction and low stock alert features in the Wonderful Trading MGT system.

## System Features

### 1. **Automatic Inventory Reduction**
- When an Inventory Clerk subtracts quantity from an item, the system automatically reduces the stock
- All operations are logged in the inventory flow history

### 2. **Low Stock Alert System**
- Triggers when inventory quantity falls to or below the minimum threshold
- Default minimum quantity: **10 units** (configurable per item)
- Alerts are published via GraphQL subscription (`lowStockAlert`)
- Console logs are generated for monitoring

---

## Testing Steps

### **Prerequisites**
1. Ensure both backend and frontend servers are running:
   ```bash
   # Backend (in f:/docs/Wonderful trading/MGT)
   npm start
   
   # Frontend (in f:/docs/Wonderful trading/MGT/MGT-frontend-main)
   npm start
   ```

2. Login credentials needed:
   - **InventoryClerk** account (for subtract operations)
   - **SuperAdmin** or **Accountant** account (for adding new items)

---

## Test Scenario 1: Add New Inventory Item

### Steps:
1. **Login as SuperAdmin or Accountant**
2. Navigate to **Inventory** page (one of: Fixed Assets, Current Assets, or Accessory)
3. Click **"Create [Asset Type] Assets"** button
4. Fill in the form:
   ```
   Item Code: TEST001
   Item Name: Test Paper A4
   Unit: Ream
   Size: A4
   Color: White
   Quantity: 15
   (minQuantity will default to 10)
   ```
5. Click **"Add Item"**
6. Verify the item appears in the inventory table with **green** quantity (since 15 > 10)

---

## Test Scenario 2: Test Automatic Reduction

### Steps:
1. **Login as InventoryClerk**
2. Navigate to the **Inventory** page
3. Click on the item you created (TEST001)
4. In the dialog:
   - Select **"Subtract (-)"** radio button
   - Enter quantity: `3`
   - Click **"Subtract (-)"** button
5. **Expected Results:**
   - Success message: "Quantity subtracted successfully"
   - Item quantity updates from 15 to **12**
   - Quantity still shows in **green** (12 > 10)
   - Operation logged in inventory history

### Verify in Backend Console:
Check the backend terminal for log output similar to:
```
response { _id: '...', operation: 'SUBTRACT', quantity: 3, ... }
```

---

## Test Scenario 3: Trigger Low Stock Alert

### Steps:
1. **Still logged in as InventoryClerk**
2. Click on the same item (TEST001) again
3. Subtract more quantity to bring it below threshold:
   - Select **"Subtract (-)"**
   - Enter quantity: `3` (this will bring total to 9, which is < 10)
   - Click **"Subtract (-)"**

4. **Expected Results:**
   - Success message appears
   - Item quantity updates to **9**
   - Quantity now shows in **RED** (visual indicator: quantity ≤ 10)
   
### Verify in Backend Console:
You should see the low stock alert log:
```
LOW STOCK ALERT: Item Test Paper A4 (ID: 67...) is low on stock! Current: 9, Min: 10
```

### Verify GraphQL Subscription (Advanced):
If you have a GraphQL client subscribed to `lowStockAlert`, you'll receive:
```graphql
subscription {
  lowStockAlert {
    id
    itemName
    quantity
    minQuantity
  }
}
```

---

## Test Scenario 4: Add Quantity Back

### Steps:
1. Click on the low-stock item
2. Select **"Add (+)"** radio button
3. Enter quantity: `5`
4. Click **"Add (+)"**
5. **Expected Results:**
   - Quantity increases from 9 to **14**
   - Color changes back to **green** (14 > 10)
   - No alert triggered (only triggers on subtract when crossing threshold)

---

## Test Scenario 5: View Inventory History

### Steps:
1. **Login as InventoryClerk, Manager, or SuperAdmin**
2. Click on any inventory item
3. Toggle **"Show Inventory History"** switch
4. **Expected Results:**
   - A data grid appears showing all operations
   - Each row shows:
     - **Quantity** changed
     - **Operation** (ADD in green / SUBTRACT in red)
   - History is sorted by most recent first

---

## Key Code Locations

### Backend Alert Logic
**File:** `f:/docs/Wonderful trading/MGT/model/graphQL/inventory.js`
**Lines:** 100-104
```javascript
// Alert Logic
if (response.quantity <= response.minQuantity) {
  console.log(`LOW STOCK ALERT: Item ${response.itemName} (ID: ${response.id}) is low on stock! Current: ${response.quantity}, Min: ${response.minQuantity}`);
  pubsub.publish("LOW_STOCK", { lowStockAlert: response });
}
```

### Frontend Visual Indicator
**File:** `f:/docs/Wonderful trading/MGT/MGT-frontend-main/src/scenes/inventory/index.jsx`
**Lines:** 197-207
```javascript
renderCell: (params) => (
  <Typography
    fontSize={18}
    fontWeight="bold"
    color={
      params.row.quantity > 10 ? colors.greenAccent[500] : colors.red[100]
    }
  >
    {params.row.quantity}
  </Typography>
)
```

---

## Troubleshooting

### Alert Not Triggering?
1. Check backend console for errors
2. Verify `minQuantity` is set correctly (default: 10)
3. Ensure you're using **InventorySubtractQuantity** mutation (not manual DB update)
4. Check that quantity crosses the threshold (e.g., 11 → 9, not 12 → 11)

### Quantity Not Updating?
1. Check network tab for GraphQL errors
2. Verify InventoryClerk permissions in `middleware/permissions.js`
3. Ensure `refetch()` is called after mutation

### History Not Showing?
1. Verify user role is InventoryClerk, Manager, or SuperAdmin
2. Check `inventoryHistory` state toggle
3. Verify `InventoryHistory` query permissions

---

## Example Test Data

| Item Code | Item Name | Initial Qty | Subtract | Final Qty | Alert? |
|-----------|-----------|-------------|----------|-----------|--------|
| TEST001   | Paper A4  | 15          | 3        | 12        | ❌ No   |
| TEST001   | Paper A4  | 12          | 3        | 9         | ✅ Yes  |
| TEST002   | Ink Black | 10          | 1        | 9         | ✅ Yes  |
| TEST003   | Toner     | 8           | 2        | 6         | ✅ Yes  |

---

## Summary

The inventory system automatically:
1. ✅ Reduces stock when InventoryClerk subtracts quantity
2. ✅ Logs all operations in inventory flow history
3. ✅ Triggers low stock alerts when quantity ≤ minQuantity
4. ✅ Publishes alerts via GraphQL subscription
5. ✅ Shows visual indicators (red text) for low stock items
6. ✅ Maintains complete audit trail of all inventory changes

**Note:** The alert system is **reactive** - it only triggers during subtract operations, not when viewing or adding inventory.
