
---
planned at Friday Jan 02, 2026 
## 4. Project Timeline & Schedule

### **Total Duration: 14 Weeks (6 Months)**

---

### **Phase 1: Foundation & Critical Workflow** (7.5 weeks)

#### **Task 2: Complex Production Workflow Engine**
- **2.1: Approval/Rejection Mechanism** - *2 weeks* 
  - Backend: Add status field, create accept/reject mutations
  - Frontend: Add Accept/Reject buttons, rejection dialog
  - Testing and integration
- **2.2: Reassignment Logic & Manager Notifications** - *1.5 week* 
  - Backend: Create reassignment mutation, auto-notify manager
  - Frontend: Manager reassignment UI, reassignment history
  - Testing
- **2.3: Timer System** - *2 weeks* 
  - Backend: Create Timer model, start/stop mutations
  - Frontend: Timer component, elapsed time display
  - Testing

#### **Task 4: Inventory Management**
- **4.1: Automatic Inventory Deduction** - *2 weeks* 
  - Backend: Link services to inventory, deduction service
  - Frontend: Inventory selection UI, deduction preview
  - Testing
- **4.2: Low Stock Alerts** 
  - Backend: Low stock query, scheduled cron job
  - Frontend: Low stock indicators, alert banner
  - Testing

---

### **Phase 2: Financial & Payment Integration** (8.5 weeks)

#### **Task 5: Local Payment Integration**
- **5.1: Chapa Payment Gateway Integration** - *5 weeks*
  - Backend: Install Chapa SDK, create Payment model, webhook endpoint
  - Frontend: Payment button, payment status display, payment history
  - Chapa integration and testing
- **5.2: Payment Status Tracking & Delivery Authorization** 
  - Backend: Payment check in delivery, pending payments query
  - Frontend: Payment status badge, delivery authorization UI
  - Testing

#### **Task 7: Reporting & Dashboards** - *3.5 weeks*
- **7.1: Owner Dashboard - Revenue & Financial Reports**  
  - Backend: Daily/weekly/monthly sales queries, payment reports
  - Frontend: Revenue charts, sales tables, export functionality
  - Testing
- **7.2: Manager Dashboard - Productivity & Workload** 
  - Backend: Worker productivity queries, workshop workload, fulfillment rates
  - Frontend: Productivity charts, workload visualization
  - Testing

---

### **Phase 3: Communication & Monitoring** (6 weeks)

#### **Task 6: Notifications & Alerts** - *6 weeks*
- **6.1: Email Service Integration** 
  - Backend: Install email service, create email templates, integrate triggers
  - Frontend: Email preferences (future enhancement)
  - Testing
- **6.2: SMS Alerts Integration** 
  - Backend: Enhance SMS function, create SMS templates, add triggers
  - Frontend: SMS notification toggle (future)
  - Testing
- **6.3: Enhanced Notification System** 
  - Backend: Create Notification model, notification preferences
  - Frontend: Notification center, read/unread states, real-time updates
  - Testing

---

### **Phase 4: Mobile & Polish** (3 weeks)

#### **Task 8: Technical Foundation**
- **8.1: Mobile Responsive UI** - *3 weeks* (Week 13.5 - Week 15.5)
  - Frontend: Audit all pages, optimize layouts, touch-friendly interactions
  - Mobile-specific layouts for key workflows
  - Testing across devices

---

## 5. Resource Requirements

### **Team Composition**

| Role | Allocation | Responsibilities |
|------|------------|------------------|
| **Backend Developer** | Full-time | GraphQL mutations, database models, payment integration, email/SMS services |
| **Frontend Developer** | Full-time | React components, UI/UX, mobile responsiveness, charts |
| **Full-Stack Developer** | Part-time (0.5) | Integration work, testing, bug fixes |
| **QA Tester** | Part-time (0.5) | Testing each phase, regression testing |
| **Project Manager** | Part-time (0.25) | Coordination, timeline tracking, stakeholder communication |

### **Technology Stack Additions**

| Technology | Purpose | Estimated Cost |
|------------|---------|----------------|
| **Chapa Payment Gateway** | Payment processing | Transaction fees (per Chapa pricing) |
| **Email Service** (SendGrid/AWS SES) | Email alerts | ~$15-50/month (depending on volume) |
| **SMS Service** (existing httpsms.com) | SMS alerts | Per SMS pricing |
| **Cron Job Service** (node-cron) | Scheduled tasks | Free (self-hosted) |

---

## 6. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Chapa API changes** | High | Medium | Use official SDK, maintain version compatibility |
| **Email delivery issues** | Medium | Low | Use reliable provider (SendGrid), implement retry logic |
| **Mobile UI complexity** | Medium | Medium | Progressive enhancement, test on real devices early |
| **Performance with large datasets** | High | Low | Implement pagination, database indexing, caching |
| **Integration delays** | Medium | Medium | Buffer time in schedule, parallel development where possible |
| **Third-party service downtime** | Medium | Low | Implement fallback mechanisms, error handling |

---

## 7. Success Criteria

### **Phase 1 Success:**
- ✅ Designers/Workshops can accept/reject orders
- ✅ Managers receive notifications on rejections
- ✅ Inventory automatically deducts when orders move to production
- ✅ Low stock alerts trigger when threshold reached

### **Phase 2 Success:**
- ✅ Chapa payment integration functional
- ✅ Payment status tracked and displayed
- ✅ Orders can only be delivered after payment completion
- ✅ Owner dashboard shows revenue and sales reports
- ✅ Manager dashboard shows productivity metrics

### **Phase 3 Success:**
- ✅ Email alerts sent for all critical events
- ✅ SMS alerts functional for urgent notifications
- ✅ Notification center shows all user notifications
- ✅ Users can mark notifications as read

### **Phase 4 Success:**
- ✅ All pages responsive on mobile devices (tested on real phones)
- ✅ Touch interactions work smoothly
- ✅ Mobile navigation intuitive

---

## 8. Deliverables by Phase

### **Phase 1 Deliverables:**
- Approval/Rejection system (backend + frontend)
- Reassignment functionality
- Timer system with tracking
- Automatic inventory deduction
- Low stock alert system

### **Phase 2 Deliverables:**
- Chapa payment integration (backend + frontend)
- Payment status tracking
- Payment-to-delivery authorization
- Owner dashboard with revenue reports
- Manager dashboard with productivity metrics

### **Phase 3 Deliverables:**
- Email service with templates
- SMS alert system
- Enhanced notification center
- Notification preferences

### **Phase 4 Deliverables:**
- Mobile-responsive UI (all pages)
- Mobile-optimized workflows
- Touch-friendly interactions

---
