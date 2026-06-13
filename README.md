# KyuR (Kuick Return)

KyuR is a QR-based lost-and-found system built for the PUP community. It helps users report lost or found items, attach photos, generate searchable item records, and connect with other users through secure real-time messaging. The platform is designed to make item recovery faster, more organized, and easier to track than a manual bulletin-board approach.

## Problem

Lost-and-found processes are often slow, manual, and difficult to track. People who find an item usually have no fast way to identify the owner, while owners have limited visibility into where and how their item was reported. KyuR addresses this by providing a centralized digital system for reporting, searching, and communicating about lost and found items.

## Solution

KyuR is a full-stack MERN application with a React frontend, Express backend, MongoDB database, Socket.io real-time messaging, and AWS S3 image storage. Users can register, verify their email, report items, browse public listings, view item details, chat with other users, and track item status from their dashboard. Administrators also have access to analytics through a dedicated dashboard.

The system focuses on QR-assisted item identification and communication. When an item is reported, it can be linked to a location ID and shared through the platform so that owners and finders can quickly identify the item and coordinate recovery.

---

## Technologies Used

- **Frontend:** React, Vite, React Router, Axios, Socket.io Client, Lucide React
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io
- **Authentication and Security:** JWT, bcrypt, Helmet, CORS, rate limiting
- **File Storage:** AWS S3 and Multer
- **Email Delivery:** Nodemailer
- **Testing:** Jest, Supertest, MongoDB Memory Server


## Key Features

- User registration, login, email verification, and password recovery
- Lost and found item reporting with image upload
- Search, filtering, and pagination for item listings
- Item detail pages with secure real-time chat
- Status updates for items such as lost, found, and claimed
- Profile dashboard for managing reported items and account settings
- Admin analytics dashboard for monitoring users, items, and chat activity
- QR-based workflow for faster item identification and recovery

---

## How to Run the Project

### Prerequisites

- Node.js installed
- MongoDB running locally or a cloud MongoDB connection string
- AWS S3 bucket credentials for image uploads
- Email service credentials for verification and password reset emails

### Backend Setup

1. Open the backend folder.
2. Copy `backend/.env.example` to `backend/.env`.
3. Fill in the required environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - AWS credentials and bucket name
   - Email host, port, user, and password
4. Install dependencies.
5. Start the backend server.

Commands:

```bash
cd backend
npm install
npm run dev
```

The backend runs on port `5000` by default.

### Frontend Setup

1. Open a new terminal in the frontend folder.
2. Install dependencies.
3. Start the Vite development server.

Commands:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on port `5173` by default.

### Optional Checks

- Run backend tests with `npm test` inside the `backend` folder.
- Run frontend linting with `npm run lint` inside the `frontend` folder.

<div align="left">
  <h3>Documentation Demo</h3>
  
  <video src="documentationAssets\ShortDemo.mp4" width="100%" controls>
    Your browser does not support the video tag.
  </video>
</div>


## Project Structure

- `backend/` contains the Express API, MongoDB models, controllers, middleware, tests, and Socket.io setup
- `frontend/` contains the React UI, pages, reusable components, and client-side services
- `postman/` contains API collection resources for manual testing

## License

This project is intended for academic and project submission use.

---

<div align="center">

## People Involved

**Project Lead**<br>
[HitsukiMok (K)](https://github.com/HitsukiMok)

**Development Lead**<br>
[Jimuelle07](https://github.com/Jimuelle07)

**Developers**<br>
[ycerdari](https://github.com/ycerdari) &nbsp;|&nbsp; [Tipaklong](https://github.com/yncyyalln)

**Scholars | Academics**<br>
Gomez &nbsp;|&nbsp; Sace &nbsp;|&nbsp; Tombocon &nbsp;|&nbsp; Tesado &nbsp;|&nbsp; Dañganan

**UI & UX | Graphic Designers**<br>
Conception &nbsp;|&nbsp; Agalabia &nbsp;|&nbsp; Domingo &nbsp;|&nbsp; Pugosa &nbsp;|&nbsp; Rodriguez

</div>