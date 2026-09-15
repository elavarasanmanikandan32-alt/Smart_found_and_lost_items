# 🔍 Smart Lost & Found System

A modern, full-stack web application designed for educational campuses, organizations, and communities to report lost and found items, search items with real-time filters, submit ownership claim requests, and manage items seamlessly.

Built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) following a clean **MVC (Model-View-Controller)** architecture.

---

## 🚀 Key Features

* **User Authentication**: Secure user registration and login with encrypted passwords (bcryptjs) and JWT-protected sessions.
* **Lost & Found Reporting**: Unified reporting interface with item details, category selection, location tags, date, status, and optional image attachments.
* **Browse & Real-Time Search**: Search by keyword/title and multi-criteria filtering (Lost vs Found, Category, Location, and Status) backed directly by MongoDB regex queries.
* **Claim Request Workflow**: Community members can file claim requests on Found items with proof of ownership. The system prevents duplicate claims and self-claiming.
* **Review & Verification**: Item finders can view, approve, or reject incoming claims. Approving a claim automatically updates the item status to `Claimed`.
* **Personal Management ("My Reports")**: View all personal submissions, update status, edit item details, delete reports, and view claim requests.
* **Live Analytics Dashboard**: Dynamically computed MongoDB metrics showing Total Lost Items, Total Found Items, Claimed/Resolved items, and Active Reports alongside recent activity.
* **Modern Responsive UI**: Clean, mobile-friendly design with subtle micro-interactions, sleek badges, and glassmorphism styling.

---

## 🛠️ Technology Stack

### Frontend
* **React.js** (Functional Components & Hooks)
* **React Router DOM v6** (Protected routing & navigation)
* **Axios** (API requests with automatic JWT bearer interceptors)
* **Vanilla Modern CSS** (Responsive CSS Variables, Glassmorphism, Clean Grid system)
* **Vite** (Next-generation lightning-fast frontend tooling)

### Backend
* **Node.js & Express.js** (MVC RESTful APIs)
* **Mongoose & MongoDB** (Data modeling & queries)
* **JWT (jsonwebtoken)** & **bcryptjs** (Secure authentication & hashing)
* **Multer** (Optional image upload handling)
* **CORS & Dotenv** (Middleware & environment configuration)

---

## 📁 Project Structure

```text
smart-lost-found/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Items.jsx
│   │   │   ├── ReportItem.jsx
│   │   │   ├── MyReports.jsx
│   │   │   └── Claims.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   └── Claim.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── claimController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── claimRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **npm**
* **MongoDB** (Local instance or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-lost-found.git
cd "smart-lost-found"
```

### 2. Configure Backend Environment
Navigate to `backend/` and verify or create `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-lost-found
JWT_SECRET=supersecret_jwt_key_2026_smart_lost_found
CLIENT_URL=http://localhost:5173
```
*(Note: If local MongoDB is not running, the application includes an in-memory database fallback for instant local testing!)*

### 3. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`.

---

## 📡 REST API Overview

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & get token | Public |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Protected (JWT) |

### Items
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/items` | Report a Lost or Found item | Protected (JWT) |
| `GET` | `/api/items` | Query items (filters: `search`, `type`, `category`, `location`, `status`) | Public |
| `GET` | `/api/items/:id` | Get single item details | Public |
| `PUT` | `/api/items/:id` | Update report (title, description, location, etc.) | Protected (Owner) |
| `DELETE` | `/api/items/:id` | Delete report & its associated claims | Protected (Owner) |
| `PATCH` | `/api/items/:id/status` | Update item status (Active, Claimed, Resolved) | Protected (Owner) |
| `GET` | `/api/items/my-reports` | Retrieve items reported by current user | Protected (JWT) |

### Claims
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/claims` | Submit claim request for a found item | Protected (JWT) |
| `GET` | `/api/claims/my` | Retrieve claims submitted by current user | Protected (JWT) |
| `GET` | `/api/claims/received` | Retrieve claims received on user's found items | Protected (JWT) |
| `GET` | `/api/claims/item/:itemId` | Retrieve claims for specific item | Protected (Owner) |
| `PATCH` | `/api/claims/:id` | Approve or reject claim request | Protected (Owner) |

### Dashboard
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Real-time counts (Lost, Found, Claimed, Active) | Public |

---

## 🔄 User Flow Walkthrough

```text
Register / Login
       ↓
Dashboard (Live Stats)
       ↓
Report Item (Lost or Found)
       ↓
Browse Items (Search & Filter)
       ↓
Submit Claim on Found Item
       ↓
Item Reporter Reviews Claim in "My Reports" / "Claims"
       ↓
Approve or Reject Claim
       ↓
Item Status Updates to "Claimed"
       ↓
Live Dashboard Stats Update
```

---

## 🔒 Security Practices

* **Passwords**: Safely salted and hashed using `bcryptjs` before storage in MongoDB.
* **JWT**: Stateless token-based authentication verified on protected routes.
* **Authorization Checks**: Strict backend validation ensuring users can only edit/delete their own reports and approve/reject claims for items they reported.
* **Sanitization**: Parameterized queries and regex escaping to prevent injection attacks.
* **Credentials**: Kept strictly in `.env` and excluded via `.gitignore`.
