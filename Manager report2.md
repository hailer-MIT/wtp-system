FEATURES DEVELOPED & ENHANCEMENTS MADE & BUGS FIXED

Bugs Fixed:

 Bug #1: Designer and Workshop Not Receiving Real-Time Notifications
 - Issue: When Reception places an order and assigns it to a Designer, the Designer wasn't able to receive notifications.

 Bug #2: Designer Orders Not Appearing in Order List
 - Issue: New orders assigned to Designer didn't appear in Designer's order list even after refresh.


Enhancements Made: 

 - Eye icon added to login page for all roles
 - Profile Menu & Settings and notification icon counting and dropdown, and automatic reduction when new orders are seen in order details
 - sidebar appearance and responsiveness
 - status cards of dashboard display appearance changed
 - unit price and total price of order details display appearance changed
 - full payment input form now gets calculated by it self from total price of all services summed up

Features Developed from the overall plan :

 Task 1.1: Fix Notification Bugs 
- Estimated Fixing Time: one day
- Impact: Blocks entire workflow
- Dependencies: None
- Status: FIXED (2 of 3 bugs fixed, 1 needed testing)

 Task 1.2: Approval/Rejection Mechanism 
- Description: Designers/Workshops can accept/reject orders with reason
- Estimated Development Time: 2 weeks
- Impact: Core workflow requirement
- Features:
  - Accept/Reject buttons in Designer/Workshop views
  - Rejection dialog with reason field
  - Assignment status tracking (Pending → Accepted → Rejected)
  - UI updates for assignment status

 Task 1.3: Reassignment Logic & Manager Notifications 
- Description: When worker rejects, manager gets notified and can reassign
- Estimated Development Time: 1 week
- Impact: Prevents workflow blockage
- Features:
  - Automatic manager notifications on rejection
  - Manager reassignment UI
  - Reassignment history tracking
  - Reassignment mutation



  
Just to show the list of all features I planned to implement, here is only the title of the features:

FEATURES TO BE BUILT FOR THIS SYSTEM

The following features are planned for development:

1. Notification Bugs (Critical Fixes)
2. Approval/Rejection 
3. Reassignment Logic 
4. Auto Inventory Deduction (Backend Implemented)
5. Low Stock Alerts (Backend Implemented)
6. Time Tracking System (✅ IMPLEMENTED) 
7. Payment Integration 
8. Payment Authorization and payment status tracking 
9. Revenue Reports to superadmin and manager.
10. Productivity Dashboard 
11. Email Integration 
12. SMS Integration 
13. Enhanced Notifications 
14. Mobile Optimization 

Feature Details:

 Task 4: Automatic Inventory Deduction
- Description: Auto-deduct inventory when orders move to production (Printing)
- Status: ✅ BACKEND IMPLEMENTED
- Features:
  - Database schema updated for Service-to-Inventory mapping
  - Auto-deduction logic triggers when Workshop starts "Printing"
  - Inventory history logging

 Task 5: Low Stock Alerts
- Description: System checks for low stock during usage
- Status: ✅ BACKEND IMPLEMENTED
- Features:
  - `minQuantity` threshold added
  - `LOW_STOCK` real-time alert event created
 Task 6: Time Tracking System
- Description: Tracks precise timestamps for every order status change.
- Status: ✅ IMPLEMENTED
- Features:
  - Database schema updated with date fields for Pending, DesigningStartDate, DesignerCompletedDate, WaitingForPrint, Printing, Completed, Delivered.
  - Backend logic captures server time (OS time) automatically on status transitions.
  - Frontend Order Details modal updated to display these timestamps in a vertical list, always showing fields even if empty (---).
