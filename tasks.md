# Production Roadmap: Pending Features & Integrations

This document tracks all remaining development tasks required to make the Whisper AI Healthcare Portal production-ready.

---

## 1. Blog, Community, and Dynamic Advertisement Features

### Backend Development Tasks (FastAPI & DB)
- [ ] **Blog & Comment Models**:
  - Implement `BlogAuthor` database model in `app/models/` for writer bios.
  - Implement `BlogPost` database model supporting markdown, drafts, and categories.
  - Implement `BlogComment` database model with approval status and nested replies.
  - Configure SQLAlchemy relationships between authors, posts, and comments.
- [ ] **Community Forum Models**:
  - Implement `CommunityGroup` model to separate interest areas (e.g., Cancer Support, Geriatric Care).
  - Implement `CommunityPost` model for discussion threads.
  - Implement `CommunityComment` model for thread replies.
- [ ] **Dynamic Ad Manager Models**:
  - Implement `Advertisement` model storing assets (images, external redirect URLs, action flags).
  - Implement `AdPlacementConfig` model specifying target placement keys (e.g., header, sidebar, blog paragraph index).
- [ ] **API Route Endpoints**:
  - Implement `GET /api/blogs` public feed with pagination and category filters.
  - Implement `GET /api/blogs/{slug}` article endpoint with verified comments.
  - Implement `POST /api/blogs/{slug}/comments` comment creation endpoint (sets status to pending moderation).
  - Implement `GET /api/communities` and thread-creation endpoints.
  - Implement `GET /api/ads/active` matching active placement rules.

### Frontend Patient Portal Features
- [ ] **Blog Article Reader**:
  - Render full rich-text contents of blog articles dynamically.
  - Implement interactive comment section showing threaded replies.
  - Integrate report/flag triggers for inappropriate comment reporting.
- [ ] **Community Groups Forum**:
  - Build board lists with thread navigation.
  - Highlight verified doctor comments using professional role badges.
- [ ] **Dynamic Ad Injections**:
  - Integrate contextual ad zones inside blog layouts matching configurations fetched from the ad API.

### Admin Portal Management Features
- [ ] **Comment Moderation Monitor**:
  - Table of pending comments with user profiles, comment text, and blog links.
  - Batch actions: **Approve** (publish to post), **Flag** (under investigation), **Hide/Delete** (violating terms).
- [ ] **Dynamic Ad Placement Configurator**:
  - Form to upload new image banners, link target configurations, and active date ranges.
  - Visual selector or numeric input to set exactly which paragraph or card position displays the ad in blog views.
  - Dashboard analytics widgets showing impression metrics and click-through rates (CTR).

---

## 2. Transportation & Patient Cab Booking Integration

### Backend Development Tasks (FastAPI & DB)
- [ ] **Ride Booking DB Models**:
  - Implement `RideBooking` database model (columns: `id`, `appointment_id`, `pickup_address`, `dropoff_address`, `ride_provider`, `vehicle_type`, `estimated_fare`, `is_return_ride`, `status` [scheduled/dispatched/completed/cancelled], `wheelchair_access`, `assistance_required`, `companions_count`, `payment_method`).
  - Configure relationships to `Appointment` (allowing auto-dispatch and ride synchronization).
- [ ] **API Endpoints**:
  - Implement `POST /api/transportation/book` endpoint to create a ride reservation.
  - Implement `GET /api/transportation/ride/{appointment_id}` to retrieve active ride tracking state.
  - Implement webhook receivers for mock Uber/Ola provider status update events.

### Frontend Refactoring
- [ ] Replace `localStorage` mock logic in `BookRidePage.tsx` and `TransportationWidget.tsx` with axios backend API calls (`createPharmacyOrder`-style handlers).
- [ ] Integrate actual backend polling/websockets for driver location update events on `RideMapTracker.tsx`.

---

## 3. Ancillary, Allied, and Therapeutic Search Pages

### Frontend Pages Implementation
- [ ] **Ancillary Search Page**:
  - Create search/listings page at `/ancillary/search` (previously empty route).
  - List services like elder day care, home nursing, physiotherapy, and physical assistance.
- [ ] **Allied Search Page**:
  - Create search/listings page at `/allied/search` (previously empty route).
  - List providers for alternative healthcare (acupuncture, ayurveda, homeopathy).
- [ ] **Therapeutic Search Page**:
  - Create search/listings page at `/therapeutic/search` (previously empty route).
  - List rehabilitation centers and occupational therapy clinics.

### Backend Support Endpoints
- [ ] Create generic lookup endpoints for finding registered local facilities, therapists, and alternative clinics matching category filters.

---

## 4. Admin Billing Portal

### Admin Console & Backend Billing
- [ ] **Admin Billing Screen**:
  - Implement `AdminBillingPage` component at `/admin/billing` (currently registered route with no UI view).
  - Add tables for medical co-pay logs, hospital invoices, and NEMT reimbursement requests.
- [ ] **Consolidated Checkout**:
  - Implement dynamic checkout invoices bundling consultation fees, pharmacy orders, and transportation costs.

---

## 5. Caregiver Notifications & Real-Time Alerts

### SMS & Push Notification Engine
- [ ] Integrate a backend notification service (e.g., Twilio / WhatsApp) to trigger automated SMS status updates to registered caregiver contact numbers (e.g., dispatch notices, arrival updates, emergency SOS locations).
