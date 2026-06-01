# KyuR Backend API & Socket.io Documentation

Welcome to the KyuR backend! This document provides all the necessary details for frontend developers to connect to the backend, handle authentication, manage items, and integrate real-time messaging.

## Base Configuration
- **Base URL (Local):** `http://localhost:5000/api`
- **Socket.io URL (Local):** `http://localhost:5000`
- **Authentication:** All protected routes expect a JWT token in the Authorization header: `Authorization: Bearer <token>`
- **Response Format:** All API responses follow a consistent envelope:
  ```json
  {
    "success": true, // or false on error
    "data": { ... }, // Payload
    "message": "...", // Optional string (mostly on auth endpoints)
    "count": 10       // Optional (when returning arrays)
  }
  ```

---

## 1. Authentication Endpoints

### Register User
**`POST /auth/register`**
- **Body (JSON):** `name`, `email` (Must end in `@iskolarngbayan.pup.edu.ph`), `password`
- **Returns:** User object with a `token`. Note: The account starts as `isVerified: false`. A verification email is automatically sent.

### Login User
**`POST /auth/login`**
- **Body (JSON):** `email`, `password`
- **Returns:** User object and `token`.

### Get Profile (Protected)
**`GET /auth/profile`**
- **Headers:** `Authorization: Bearer <token>`
- **Returns:** The authenticated user's details (password stripped).

### Email Verification
**`GET /auth/verify/:token`**
- **Desc:** Normally hit directly via a link in the user's email, but you can also hit it via AJAX.
- **Returns:** Success message.

### Forgot Password
**`POST /auth/forgotpassword`**
- **Body (JSON):** `email`
- **Returns:** Success message.

### Reset Password
**`PUT /auth/resetpassword/:token`**
- **Body (JSON):** `password` (min 6 characters)
- **Returns:** The updated User object and a fresh `token`.

---

## 2. Items Endpoints

> [!IMPORTANT]
> All item routes require authentication (`Authorization: Bearer <token>`).

### Create Item
**`POST /items/createItem`**
- **Content-Type:** `multipart/form-data` (Do NOT send JSON)
- **Form Data Fields:**
  - `title` (String)
  - `description` (String)
  - `category` (Enum: `electronics`, `wallet`, `id`, `accessories`, `other`)
  - `status` (Enum: `lost`, `found`, `claimed`)
  - `locationId` (String - maps to a QR code ID)
  - `image` (File - Image up to 5MB)
- **Returns:** The created item, including the newly generated `imageUrl` from AWS S3.

### Get Items (Search & Pagination)
**`GET /items/getItems`**
- **Query Params (Optional):**
  - `status` (exact match)
  - `category` (exact match)
  - `locationId` (exact match)
  - `search` (full-text search on title and description)
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Returns:** 
  ```json
  {
    "success": true,
    "data": {
      "items": [{...}, {...}],
      "page": 1,
      "pages": 5,
      "total": 45
    }
  }
  ```

### Get Single Item
**`GET /items/:id`**
- **Returns:** Single item object, with `reportedBy` and `claimedBy` populated (includes their names and emails).

### Update Item Status
**`PUT /items/:id/status`**
- **Body (JSON):** `status` (Enum: `lost`, `found`, `claimed`)
- **Returns:** The updated item. If `status` is sent as `claimed`, the backend automatically sets `claimedBy` to the current user's ID.

---

## 3. Messaging (REST)

> [!IMPORTANT]
> Messaging heavily relies on Socket.io for real-time. REST endpoints are just used for fetching history and fallback read-receipts. All require auth.

### Get Message History
**`GET /messages/:itemId`**
- **Returns:** Array of all messages for the specific item, sorted chronologically (oldest first). `sender` and `receiver` are populated with `name` and `_id`.

### Mark Message as Read (REST Fallback)
**`PUT /messages/:id/read`**
- **Desc:** Only the intended receiver can mark a message as read.
- **Returns:** The updated message object (`isRead: true`).

---

## 4. Socket.io (Real-Time)

To connect to Socket.io, the frontend must pass the user's JWT token in the handshake auth object.

```javascript
// Frontend Connection Example
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

### Events the Frontend EMITS to the Server:
1. **`join_room`**
   - **Payload:** `{ itemId: "60d5ecb8b392d..." }`
   - **Desc:** Call this when a user opens a chat for a specific item.
2. **`send_message`**
   - **Payload:** `{ itemId: "...", receiverId: "...", content: "Hello!" }`
   - **Desc:** Sends a message. The server validates, saves to MongoDB, and broadcasts it to the room.
3. **`typing`** & **`stop_typing`**
   - **Payload:** `{ itemId: "..." }`
   - **Desc:** Broadcasts typing status to the other user in the room.
4. **`mark_read`**
   - **Payload:** `{ messageId: "...", itemId: "..." }`
   - **Desc:** Updates MongoDB that a message is read and instantly notifies the sender's UI.

### Events the Frontend LISTENS for from the Server:
1. **`receive_message`**
   - **Payload:** A fully populated message object (matching the MongoDB schema, including populated sender/receiver).
   - **Action:** Append to your chat UI array.
2. **`typing`** & **`stop_typing`**
   - **Payload:** `{ userId: "..." }`
   - **Action:** Show/hide a "User is typing..." indicator.
3. **`message_read`**
   - **Payload:** `{ messageId: "..." }`
   - **Action:** Add a "Read" checkmark next to the corresponding message in your UI.
4. **`error`**
   - **Payload:** `{ message: "Error description" }`
   - **Action:** Show a toast/alert to the user if something failed (e.g. invalid token).
