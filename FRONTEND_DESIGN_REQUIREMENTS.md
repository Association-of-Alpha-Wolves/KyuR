# KyuR — Frontend Design Requirements

This document lists every page that needs to be designed and built for the KyuR lost-and-found platform. The frontend uses **React 19 + Vite + React Router DOM v7**. No UI component library is installed yet — all designs will be implemented with custom CSS.

---

## App Overview

KyuR is a campus lost-and-found platform for PUP (Polytechnic University of the Philippines) students and faculty. Users report lost or found items, browse the item feed, and contact item reporters via real-time chat. All users must have a `@iskolarngbayan.pup.edu.ph` email.

---

## Pages

### 1. Landing Page
**Route:** `/`
**Access:** Public

**Purpose:** Introduce the app to visitors, drive registrations.

**Required UI elements:**
- Navigation bar: logo/app name, Login button, Register button
- Hero section: headline, short description of what KyuR is, primary CTA button ("Report an Item" or "Get Started")
- How it works section: 3-step explainer (Scan QR → Report Item → Connect with Finder)
- Recent lost/found items preview (optional, fetches from `GET /api/items/getItems`)
- Footer: links to login/register

---

### 2. Login Page
**Route:** `/login`
**Access:** Public (redirect to `/items` if already logged in)

**Required UI elements:**
- KyuR logo / branding
- Email input (placeholder: `yourname@iskolarngbayan.pup.edu.ph`)
- Password input (with show/hide toggle)
- "Login" submit button
- Link to `/register`
- Link to `/forgot-password`
- Inline error messages for invalid credentials

**API:** `POST /api/auth/login`

---

### 3. Register Page
**Route:** `/register`
**Access:** Public (redirect to `/items` if already logged in)

**Required UI elements:**
- KyuR logo / branding
- Full name input
- PUP email input (must end in `@iskolarngbayan.pup.edu.ph`)
- Password input (min 6 characters, show/hide toggle)
- "Create Account" submit button
- Link back to `/login`
- Inline validation errors (duplicate email, invalid domain, short password)
- Success state: "Account created! You can now log in."

**API:** `POST /api/auth/register`

---

### 4. Forgot Password Page
**Route:** `/forgot-password`
**Access:** Public

**Required UI elements:**
- Back link to `/login`
- Short explanation ("Enter your PUP email and we'll send a reset link")
- Email input
- "Send Reset Link" submit button
- Success state: "If an account exists, a reset link has been sent."
- Error state for empty input

**API:** `POST /api/auth/forgotpassword`

---

### 5. Reset Password Page
**Route:** `/reset-password/:token`
**Access:** Public (token comes from the reset email link)

**Required UI elements:**
- New password input (min 6 characters, show/hide toggle)
- Confirm password input (client-side match validation)
- "Reset Password" submit button
- Success state: "Password reset! Redirecting to login..."
- Error state for expired/invalid token

**API:** `PUT /api/auth/resetpassword/:token`

---

### 6. Browse Items Page
**Route:** `/items`
**Access:** Protected (redirect to `/login` if not authenticated)

**Purpose:** The main feed — search, filter, and browse all reported items.

**Required UI elements:**
- Top bar: search input (keyword search), "Report Item" button
- Filter sidebar or filter row:
  - Status: All / Lost / Found / Claimed (tabs or select)
  - Category: All / Electronics / Wallet / ID / Accessories / Other (select or pills)
  - Location ID (text input or select if locations are known)
- Item card grid (2–3 columns):
  - Item image (fallback placeholder if no image)
  - Title, category badge, status badge
  - Location, date reported
  - Reported by (name)
  - "View Details" link
- Pagination controls (previous / page numbers / next)
- Empty state: "No items found" illustration + message
- Loading skeleton

**API:** `GET /api/items/getItems?status=&category=&search=&page=&limit=`

---

### 7. Report Item Page
**Route:** `/items/report`
**Access:** Protected

**Purpose:** Form to report a lost or found item with an optional photo.

**Required UI elements:**
- Page title: "Report a Lost or Found Item"
- Status selector: Lost / Found (radio buttons or toggle)
- Title input (max 100 characters, show character count)
- Category select: Electronics / Wallet / ID / Accessories / Other
- Description textarea (max 1000 characters, show character count)
- Location ID input (text; maps to a campus QR code)
- Image upload: drag-and-drop or click-to-browse, image preview, max 5MB, accept JPEG/PNG/WebP
- "Submit Report" button
- Success state: redirect to the new item's detail page
- Inline validation errors

**API:** `POST /api/items/createItem` (multipart/form-data)

---

### 8. Item Detail Page
**Route:** `/items/:id`
**Access:** Protected

**Purpose:** Full item information + real-time chat with the reporter.

**Layout:** Two-panel on desktop, stacked on mobile.

**Left panel — Item Info:**
- Item image (full width if present, placeholder if not)
- Title, status badge (Lost / Found / Claimed), category badge
- Description
- Location ID
- Date reported
- Reported by (name)
- If current user is the reporter:
  - "Update Status" button (opens modal or inline selector for lost/found/claimed)
  - "Delete Item" button (with confirmation dialog)

**Right panel — Chat:**
- Message thread (oldest at top, newest at bottom)
  - Each message: sender name, message text, timestamp, read receipt (checkmark)
  - Own messages: right-aligned; other user's: left-aligned
- Typing indicator ("User is typing...")
- Message input + send button
- Disabled state if current user is the reporter (they can't message themselves)
- Socket.io client required (`socket.io-client` package)

**APIs:**
- `GET /api/items/:id`
- `GET /api/messages/:itemId` (initial history load)
- Socket.io events: `join_room`, `send_message`, `typing`, `stop_typing`, `mark_read`

---

### 9. Profile Page
**Route:** `/profile`
**Access:** Protected

**Purpose:** View and edit own user profile; see items you've reported.

**Required UI elements:**
- User avatar placeholder (initials-based)
- Display name (editable inline or via edit form)
- Email (read-only)
- Role badge (student / faculty / admin)
- "Change Password" section: current password, new password, confirm new password fields
- "Save Changes" button
- User's reported items list (link to `/items?reportedBy=me` or a filtered view)
- Logout button

**APIs:**
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

---

## Shared Components (need design)

| Component | Used On |
|-----------|---------|
| Navbar / Top Bar | All protected pages |
| Item Card | Browse Items, Landing Page |
| Status Badge | Item Card, Item Detail |
| Category Badge | Item Card, Item Detail |
| Loading Skeleton | Browse Items, Item Detail |
| Empty State | Browse Items |
| Toast / Notification | Global (success/error feedback) |
| Confirmation Modal | Delete Item |
| Protected Route wrapper | All auth-gated pages |

---

## Dependencies Still Needed

Before building the Item Detail chat panel, install:

```bash
cd frontend && npm install socket.io-client
```

---

## Notes for Developers

- All protected pages should redirect to `/login` if no token is found in localStorage/sessionStorage.
- The JWT token returned on login/register should be stored client-side and sent as `Authorization: Bearer <token>` on every API request.
- `multipart/form-data` must be used for the Report Item form — do NOT use `application/json` for that endpoint.
- The reset password route (`/reset-password/:token`) receives the raw token as a URL param — pass it directly to the API.
