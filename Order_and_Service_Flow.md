# Order and Service Flow - Complete Documentation

## 📋 Table of Contents
1. [Order Creation Flow](#1-order-creation-flow)
2. [Service Management Flow](#2-service-management-flow)
3. [Order Progress Flow](#3-order-progress-flow)
4. [File Management Flow](#4-file-management-flow)
5. [Order Editing Flow](#5-order-editing-flow)

---

## 1. Order Creation Flow

### Step-by-Step Process:

#### **Step 1: Reception User Opens Dashboard**
- **Location**: `MGT-frontend-main/src/scenes/dashboard/index.jsx`
- **Role**: Reception
- **Action**: User navigates to Dashboard page
- **Code Reference**: Lines 512-760

#### **Step 2: Fill Order Form**
- **Fields Required**:
  - Customer Name (optional)
  - Contact Person (required)
  - Phone Number (required)
  - TIN Number (optional)
  - Email (optional)
  - Full Payment (required)
  - Advance Payment (required)
  - Remaining Payment (auto-calculated: Full Payment - Advance Payment)
  - Delivery Date (required)
- **Code Reference**: `dashboard/index.jsx` Lines 533-684

#### **Step 3: Add Services to Order**
- **Location**: `dashboard/index.jsx` Lines 799-1042 (`MyTable` component)
- **Process**:
  1. Click "Add Service" button
  2. Select Service from dropdown (from `AllServices` query)
  3. Fill service details:
     - Job Description (required)
     - Material (optional)
     - Size (optional)
     - Quantity (required)
     - Total Price (required)
  4. Service is added to `servicesList` state
- **Service Structure** (from `model/mongodb/order.js` Lines 14-23):
  ```javascript
  {
    service: ObjectId (ref: "Services"),
    jobDescription: String,
    material: String,
    size: String,
    progress: "Pending" (default),
    quantity: Number,
    totalPrice: Number,
    completedFilesId: [ObjectId] (for designer's completed files)
  }
  ```
- **Validation**: At least one service must be added before placing order
- **Code Reference**: `dashboard/index.jsx` Line 157: `if (servicesList.length)`

#### **Step 4: Upload Files (Optional)**
- **Location**: `dashboard/index.jsx` Lines 1044-1227 (`FileUploader` component)
- **Process**:
  1. Click "Add file" button
  2. Select file using `MuiFileInput`
  3. Add description
  4. Select target: "Designer", "Workshop", or "Both"
  5. File is uploaded via REST API: `POST /fileUpload`
  6. File ID is added to `filesList` state
- **File Upload Endpoint**: `restApi/fileUpload.js`
- **File Storage**: Files saved to `restApi/files/` directory with format: `{fileId}.{extension}`
- **File Model** (`model/mongodb/file.js`):
  ```javascript
  {
    fileName: String,
    extension: String,
    description: String,
    for: String ("Designer" | "Workshop" | "Both")
  }
  ```

#### **Step 5: Assign Order to Designer or Workshop**
- **Location**: `dashboard/index.jsx` Lines 686-737
- **Process**:
  1. Select Designer from dropdown (fetches from `AllDesigners` query)
  2. OR Select Workshop from dropdown (fetches from `AllWorkshops` query)
  3. At least ONE must be selected (Designer OR Workshop)
- **Code Validation**: `model/graphQL/order.js` Lines 271-290

#### **Step 6: Submit Order (PlaceOrder Mutation)**
- **Location**: `dashboard/index.jsx` Lines 154-196 (`handleFormSubmit`)
- **GraphQL Mutation**: `PlaceOrder`
- **Backend Handler**: `model/graphQL/order.js` Lines 266-302
- **Process**:
  1. Frontend calls `PlaceOrder` mutation with all form data
  2. Backend receives order data:
     ```javascript
     {
       customerName, contactPerson, phoneNumber, tinNumber, email,
       fullPayment, advancePayment, remainingPayment,
       services: [serviceInput],  // Array of services
       files: [fileId],           // Array of file IDs
       deliveryDate,
       designedBy: designerId (optional),
       workShop: workshopId (optional)
     }
     ```
  3. Backend processing (`order.js` Lines 266-286):
     - Sets `orderedDate = Date.now()`
     - Calculates `remainingPayment = fullPayment - advancePayment`
     - Sets `receivedBy = ctx.receptionId` (current Reception user)
     - **Progress Assignment**:
       - If `designedBy` exists → `progress = "Pending"`
       - Else if `workShop` exists → `progress = "WaitingForPrint"`
     - Creates new Order document
     - Auto-generates `orderNumber` via counter (Lines 50-66 in `order.js`)
  4. Order saved to MongoDB
  5. Publishes WebSocket event: `pubsub.publish("NEW_ORDER", { newOrder })`
  6. Returns created order with populated services

#### **Step 7: Real-time Notification**
- **Location**: `model/graphQL/order.js` Lines 381-405 (Subscription)
- **Process**:
  - WebSocket subscription `newOrder` is triggered
  - Filtered by role:
    - **SuperAdmin, Manager, Accountant, Cashier**: Receive all orders
    - **Reception**: Receive all orders EXCEPT their own
    - **Designer**: Only receive orders assigned to them (`designedBy == context._id`)
    - **Workshop**: Only receive orders assigned to them (via `workShop` field)
- **Frontend**: Browser notification shown (if permission granted)

---

## 2. Service Management Flow

### Service Structure:
Each order contains an array of services. Each service has:
- **Service Type**: Reference to Services collection
- **Job Description**: What needs to be done
- **Material**: Material specifications
- **Size**: Size specifications
- **Quantity**: How many items
- **Total Price**: Price for this service
- **Progress**: Individual service progress (default: "Pending")
- **Completed Files**: Files uploaded by designer for this service

### Service Operations:

#### **A. Add Service to Existing Order**
- **Mutation**: `OrderAddService`
- **Location**: `model/graphQL/order.js` Lines 317-326
- **Process**:
  ```javascript
  Order.findByIdAndUpdate(orderId, {
    $push: { services: newService }
  })
  ```
- **Who Can Do**: SuperAdmin, Reception (permissions.js Line 251)

#### **B. Remove Service from Order**
- **Mutation**: `OrderRemoveService`
- **Location**: `model/graphQL/order.js` Lines 304-316
- **Process**:
  ```javascript
  Order.updateOne({ _id: orderId }, {
    $pull: { services: serviceToRemove }
  })
  ```
- **Who Can Do**: SuperAdmin, Reception (permissions.js Line 250)

#### **C. Edit Service in Order**
- **Mutation**: `OrderEditService`
- **Location**: `model/graphQL/order.js` Lines 327-353
- **Process**:
  1. Finds order with matching old service
  2. Updates service fields:
     - service (service type)
     - jobDescription
     - material
     - size
     - progress
     - quantity
     - totalPrice
- **Who Can Do**: SuperAdmin, Reception (permissions.js Line 252)

---

## 3. Order Progress Flow

### Progress States Enum:
```javascript
enum progress {
  Pending          // Initial state when assigned to Designer
  Designing        // Designer is working on it
  WaitingForPrint  // Design complete, waiting for Workshop
  Printing         // Workshop is printing
  Completed        // Order is complete
  Delivered        // Order delivered to customer
}
```

### Complete Flow Diagram:

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER PROGRESS FLOW                       │
└─────────────────────────────────────────────────────────────┘

START: Order Created
│
├─→ [If assigned to Designer]
│   │
│   ├─→ Pending (Initial State)
│   │   │ Location: order.js Line 274
│   │   │ Who: Reception (when placing order)
│   │   │
│   │   ├─→ Designing
│   │   │   │ Location: designerOrders.jsx Line 562
│   │   │   │ Who: Designer (clicks "Start Designing")
│   │   │   │ Mutation: DesignerChangeOrderStatus
│   │   │   │ Handler: designer.js Lines 165-185
│   │   │   │
│   │   │   ├─→ [If Workshop exists]
│   │   │   │   │
│   │   │   │   └─→ WaitingForPrint
│   │   │   │       │ Location: designer.js Line 170
│   │   │   │       │ Auto-transition when Designer completes
│   │   │   │       │
│   │   │   │       ├─→ Printing
│   │   │   │       │   │ Location: workShopOrders.jsx Line 446
│   │   │   │       │   │ Who: Workshop (clicks "Start printing")
│   │   │   │       │   │ Mutation: WorkShopChangeOrderStatus
│   │   │   │       │   │ Handler: workShop.js Lines 122-132
│   │   │   │       │   │
│   │   │   │       │   └─→ Completed
│   │   │   │       │       │ Location: workShopOrders.jsx Line 460
│   │   │   │       │       │ Who: Workshop (clicks "Complete order")
│   │   │   │       │       │
│   │   │   │       └─→ Completed
│   │   │   │           │ Location: designer.js Line 175
│   │   │   │           │ Who: Designer (if no Workshop assigned)
│   │   │   │           │
│   │   │   └─→ Completed
│   │   │       │ Location: designerOrders.jsx Line 576
│   │   │       │ Who: Designer (clicks "Complete order")
│   │   │       │
│   │   │       └─→ [If Workshop exists] → WaitingForPrint → Printing → Completed
│   │   │
│   └─→ [If assigned to Workshop only]
│       │
│       └─→ WaitingForPrint (Initial State)
│           │ Location: order.js Line 275
│           │ Who: Reception (when placing order)
│           │
│           └─→ Printing → Completed (same as above)
│
└─→ Completed → Delivered
    │ Location: orders/index.jsx Line 414
    │ Who: Reception (clicks "Deliver Order")
    │ Mutation: ReceptionDelivereOrder
    │ Handler: reception.js Lines 95-101
```

### Detailed Progress Transitions:

#### **Transition 1: Pending → Designing**
- **Who**: Designer
- **Location**: `designerOrders.jsx` Lines 555-569
- **Action**: Click "Start Designing" button
- **Mutation**: `DesignerChangeOrderStatus(orderId, "Designing")`
- **Handler**: `designer.js` Lines 179-181
- **Result**: Order progress updated to "Designing"

#### **Transition 2: Designing → Completed**
- **Who**: Designer
- **Location**: `designerOrders.jsx` Lines 570-583
- **Action**: Click "Complete order" button
- **Mutation**: `DesignerChangeOrderStatus(orderId, "Completed")`
- **Handler**: `designer.js` Lines 165-177
- **Logic**:
  - If order has `workShop` assigned → Set to "WaitingForPrint"
  - Else → Set to "Completed"
- **Result**: Order moves to next stage

#### **Transition 3: WaitingForPrint → Printing**
- **Who**: Workshop
- **Location**: `workShopOrders.jsx` Lines 441-453
- **Action**: Click "Start printing" button
- **Mutation**: `WorkShopChangeOrderStatus(orderId, "Printing")`
- **Handler**: `workShop.js` Lines 127-130
- **Result**: Order progress updated to "Printing"

#### **Transition 4: Printing → Completed**
- **Who**: Workshop
- **Location**: `workShopOrders.jsx` Lines 454-467
- **Action**: Click "Complete order" button
- **Mutation**: `WorkShopChangeOrderStatus(orderId, "Completed")`
- **Handler**: `workShop.js` Lines 123-126
- **Result**: Order progress updated to "Completed"

#### **Transition 5: Completed → Delivered**
- **Who**: Reception
- **Location**: `orders/index.jsx` Lines 409-421
- **Action**: Click "Deliver Order" button (only visible when progress = "Completed")
- **Mutation**: `ReceptionDelivereOrder(orderId, "Delivered")`
- **Handler**: `reception.js` Lines 95-101
- **Result**: Order progress updated to "Delivered"

---

## 4. File Management Flow

### File Types:

#### **A. Order Files (Initial Upload)**
- **When**: During order creation
- **Location**: `dashboard/index.jsx` FileUploader component
- **Upload Endpoint**: `POST /fileUpload` (REST API)
- **Handler**: `restApi/fileUpload.js`
- **Process**:
  1. File selected via `MuiFileInput`
  2. Description added
  3. Target selected: "Designer", "Workshop", or "Both"
  4. FormData created and sent to `/fileUpload`
  5. File saved to `restApi/files/{fileId}.{extension}`
  6. File document created in MongoDB
  7. File ID added to order's `files` array
- **Storage**: `restApi/files/` directory
- **Model**: `model/mongodb/file.js`

#### **B. Design Files (Completed by Designer)**
- **When**: Designer completes design work
- **Location**: `designerOrders.jsx` Lines 485-550
- **Upload Endpoint**: `POST /designFileUpload/{orderId}/{serviceIndex}`
- **Handler**: `restApi/designFileUpload.js`
- **Process**:
  1. Designer clicks "upload" button for a service
  2. File selected and description added
  3. File uploaded to `/designFileUpload/{orderId}/{serviceIndex}`
  4. File added to service's `completedFilesId` array
  5. Service progress can be tracked individually
- **Purpose**: Designer uploads completed design files for specific services

#### **C. File Download**
- **Endpoint**: `GET /fileDownload/{fileId}.{extension}`
- **Handler**: `restApi/fileProvider.js`
- **Who Can Access**: Authenticated users
- **Process**:
  1. User clicks download button
  2. Request sent with Authorization header
  3. File streamed from `restApi/files/` directory
  4. File downloaded to user's device
- **Location**: Used in:
  - `orders/index.jsx` Lines 73-91
  - `designerOrders.jsx` Lines 202-220
  - `workShopOrders.jsx` Lines 83-101

---

## 5. Order Editing Flow

### Who Can Edit:
- **SuperAdmin**: Can edit orders
- **Reception**: Can edit orders (only when status is "Pending" or "WaitingForPrint")

### Edit Capabilities:

#### **A. Edit Order Details**
- **Mutation**: `OrderEdit`
- **Location**: `model/graphQL/order.js` Lines 354-379
- **Editable Fields**:
  - customerName
  - contactPerson
  - phoneNumber
  - tinNumber
  - email
  - fullPayment
  - advancePayment
  - remainingPayment
  - designedBy (change Designer assignment)
  - workShop (change Workshop assignment)
  - deliveryDate
- **Process**:
  1. Sets `edited = true` flag
  2. Saves old values to `editedFile` array (history)
  3. Updates order with new values
- **Frontend**: `orders/compontes/editOrder.jsx`

#### **B. Edit Service in Order**
- **Mutation**: `OrderEditService`
- **Location**: `model/graphQL/order.js` Lines 327-353
- **Process**: Updates specific service within order's services array

#### **C. Add/Remove Services**
- **Mutations**: `OrderAddService`, `OrderRemoveService`
- **Location**: `model/graphQL/order.js` Lines 304-326
- **Process**: Modifies services array in order

---

## 6. Order Viewing Flow

### Different Views by Role:

#### **Reception, SuperAdmin, Manager, Cashier, Accountant**
- **Page**: Orders (`/orders`)
- **Location**: `scenes/orders/index.jsx`
- **Features**:
  - View all orders with pagination
  - Filter by progress status
  - Search/filter by any field
  - View order details
  - Edit orders (SuperAdmin/Reception only)
  - Deliver orders (Reception only)

#### **Designer**
- **Page**: Dashboard → Designer Orders
- **Location**: `scenes/dashboard/DashboardComponents/designerOrders.jsx`
- **Features**:
  - View only assigned orders
  - Filter: Pending/Designing, Pending, Designing, Completed
  - Change order status (Pending → Designing → Completed)
  - Upload completed design files
  - Download order files

#### **Workshop**
- **Page**: Dashboard → Workshop Orders
- **Location**: `scenes/dashboard/DashboardComponents/workShopOrders.jsx`
- **Features**:
  - View only assigned orders
  - Filter: WaitingForPrint/Printing, WaitingForPrint, Printing, Completed
  - Change order status (WaitingForPrint → Printing → Completed)
  - Download design files
  - View completed design files

---

## 7. Data Models

### Order Model (`model/mongodb/order.js`):
```javascript
{
  orderNumber: Number (auto-generated),
  customerName: String,
  contactPerson: String (required),
  phoneNumber: Number (required),
  tinNumber: Number,
  email: String,
  fullPayment: Number (required),
  advancePayment: Number (required),
  remainingPayment: Number (required),
  services: [{
    service: ObjectId (ref: "Services"),
    jobDescription: String (required),
    material: String,
    size: String,
    progress: String (default: "Pending"),
    quantity: Number (default: 1),
    totalPrice: Number (required),
    completedFilesId: [ObjectId] (ref: "Files")
  }],
  receivedBy: ObjectId (ref: "Receptions", required),
  files: [ObjectId] (ref: "Files"),
  designedBy: ObjectId (ref: "Designers"),
  workShop: ObjectId (ref: "WorkShops"),
  orderedDate: Date (default: Date.now()),
  deliveryDate: Date (required),
  progress: String (required), // "Pending" | "Designing" | "WaitingForPrint" | "Printing" | "Completed" | "Delivered"
  satisfactionRate: Number,
  feedback: [String],
  otherFeedback: String,
  edited: Boolean (default: false),
  editedFile: [{ // History of edits
    customerName, contactPerson, phoneNumber, tinNumber, email,
    fullPayment, advancePayment, remainingPayment,
    designedBy, workShop
  }]
}
```

### Service Model (`model/mongodb/services.js`):
```javascript
{
  name: String (required),
  descriptionGuideLine: String,
  goseToDesigner: Boolean (required),
  GoseToWorkshop: Boolean (required)
}
```

### File Model (`model/mongodb/file.js`):
```javascript
{
  fileName: String,
  extension: String,
  description: String,
  for: String (required) // "Designer" | "Workshop" | "Both"
}
```

---

## 8. Key Code References

### Backend:
- **Order Creation**: `model/graphQL/order.js` Lines 266-302
- **Order Model**: `model/mongodb/order.js`
- **Service Management**: `model/graphQL/order.js` Lines 304-353
- **Progress Updates**: 
  - Designer: `model/graphQL/designer.js` Lines 165-185
  - Workshop: `model/graphQL/workShop.js` Lines 122-132
  - Reception: `model/graphQL/reception.js` Lines 95-101
- **File Upload**: `restApi/fileUpload.js`, `restApi/designFileUpload.js`
- **File Download**: `restApi/fileProvider.js`

### Frontend:
- **Order Form**: `MGT-frontend-main/src/scenes/dashboard/index.jsx` Lines 512-760
- **Service Addition**: `dashboard/index.jsx` Lines 799-1042
- **File Upload**: `dashboard/index.jsx` Lines 1044-1227
- **Order List**: `scenes/orders/index.jsx`
- **Designer Orders**: `scenes/dashboard/DashboardComponents/designerOrders.jsx`
- **Workshop Orders**: `scenes/dashboard/DashboardComponents/workShopOrders.jsx`
- **Edit Order**: `scenes/orders/compontes/editOrder.jsx`

---

## 9. Summary Flow Chart

```
ORDER LIFECYCLE:
┌──────────────┐
│   RECEPTION  │ Creates Order
│   (Dashboard)│ ├─→ Adds Services
└──────┬───────┘ ├─→ Uploads Files
       │         ├─→ Assigns Designer/Workshop
       │         └─→ Submits Order
       │
       ▼
┌──────────────┐
│   DATABASE   │ Order Saved
│   (MongoDB)  │ ├─→ Order Number Generated
└──────┬───────┘ ├─→ Progress Set
       │         └─→ WebSocket Notification Sent
       │
       ▼
┌──────────────┐
│   DESIGNER   │ (If Assigned)
│   (Dashboard)│ ├─→ Views Order (Pending)
│              │ ├─→ Starts Designing (→ Designing)
│              │ ├─→ Uploads Design Files
│              │ └─→ Completes Design (→ Completed/WaitingForPrint)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   WORKSHOP   │ (If Assigned)
│   (Dashboard)│ ├─→ Views Order (WaitingForPrint)
│              │ ├─→ Starts Printing (→ Printing)
│              │ ├─→ Downloads Design Files
│              │ └─→ Completes Printing (→ Completed)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   RECEPTION  │ Delivers Order
│   (Orders)   │ └─→ Marks as Delivered (→ Delivered)
└──────────────┘
```

---

**End of Documentation**


omplete Order and Service Flow
1. Order creation flow
Step 1: Reception fills order form
Location: Dashboard (dashboard/index.jsx)
Fields: Customer info, payment details, delivery date
Step 2: Add services
Click "Add Service"
Select service type (from Services collection)
Fill: Job Description, Material, Size, Quantity, Total Price
Service added to servicesList state
At least one service required
Step 3: Upload files (optional)
Select file, add description
Choose target: "Designer", "Workshop", or "Both"
Uploaded via REST API to /fileUpload
File IDs stored in order
Step 4: Assign to Designer or Workshop
Select Designer OR Workshop from dropdown
At least one must be selected
Step 5: Submit order
Calls PlaceOrder mutation
Backend (order.js Lines 266-286):
Sets receivedBy = current Reception user
If Designer assigned → progress = "Pending"
If Workshop assigned → progress = "WaitingForPrint"
Auto-generates orderNumber
Saves to MongoDB
Publishes WebSocket event
2. Service structure
Each order contains an array of services:

services: [{
  service: ServiceId,        // Reference to service type
  jobDescription: String,     // What needs to be done
  material: String,          // Material specs
  size: String,              // Size specs
  quantity: Number,          // How many
  totalPrice: Number,        // Price
  progress: "Pending",       // Service-level progress
  completedFilesId: [FileId] // Designer's completed files
}]


3. Order progress flow
Complete flow path:

Order Created
│
├─→ [If Designer assigned]
│   │
│   ├─→ Pending
│   │   │ (Designer clicks "Start Designing")
│   │   │
│   │   └─→ Designing
│   │       │ (Designer uploads design files)
│   │       │ (Designer clicks "Complete order")
│   │       │
│   │       ├─→ [If Workshop exists]
│   │       │   │
│   │       │   └─→ WaitingForPrint
│   │       │       │ (Workshop clicks "Start printing")
│   │       │       │
│   │       │       └─→ Printing
│   │       │           │ (Workshop clicks "Complete order")
│   │       │           │
│   │       │           └─→ Completed
│   │       │
│   │       └─→ Completed (if no Workshop)
│   │
│   └─→ [If Workshop only assigned]
│       │
│       └─→ WaitingForPrint → Printing → Completed
│
└─→ Completed → Delivered (Reception marks as delivered)


4. File management
Three types of files:
Order files (initial upload)
Uploaded during order creation
Target: Designer/Workshop/Both
Stored in restApi/files/
Design files (completed by Designer)
Uploaded per service when design is complete
Endpoint: /designFileUpload/{orderId}/{serviceIndex}
Stored in service's completedFilesId array
File download
Available to all authenticated users
Endpoint: /fileDownload/{fileId}.{extension}
5. Key operations
Add Service: OrderAddService mutation
Remove Service: OrderRemoveService mutation
Edit Service: OrderEditService mutation
Edit Order: OrderEdit mutation (saves history)
Change Progress: Role-specific mutations
The documentation file includes:
Step-by-step code references
Data model structures
Role-based access
Complete flow diagrams
File locations for each operation
All code references point to the exact files and line numbers where each operation is implemented.