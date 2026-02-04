# 🔸 Book Library API

Book Library API is a full-stack web application for browsing books, managing favourites, and writing reviews. Built with an Express.js backend (TypeScript), React frontend (Vite), MongoDB and Redis, featuring JWT authentication, role-based access (user / admin / super admin), and comprehensive CRUD operations for books, favourites, and reviews.

## 🌐 Live Demo

- **Frontend:** https://book-library-git-main-abood-hks-projects.vercel.app/
- **API Base URL:**(https://book-library-api-r7bv.onrender.com)

## 📁 Project Structure

```
book-library/
│
├── backend/                 → Express API
│   └── src/
│       ├── config/         → Configuration
│       │   ├── db.ts       → MongoDB connection
│       │   └── redis.ts    → Redis connection
│       ├── controllers/    → Route logic
│       │   ├── adminController.ts      → Admin endpoints (blacklist, remove review)
│       │   ├── authController.ts       → Signup, login, logout, refresh token
│       │   ├── booksController.ts     → Books API logic
│       │   ├── favouriteController.ts  → Favourites logic
│       │   ├── reviewController.ts     → Reviews logic
│       │   └── superAdminController.ts → Promote/demote admins
│       ├── interfaces/     → TypeScript interfaces
│       │   └── IPayload.ts
│       ├── middleware/     → Custom middleware
│       │   ├── adminOnlyMiddleware.ts
│       │   ├── authMiddleware.ts       → JWT verification
│       │   ├── loggerMiddleware.ts     → Request logging
│       │   ├── superAdminsOnlyMiddleware.ts
│       │   └── validateMiddleware.ts   → Input validation
│       ├── models/         → Mongoose schemas
│       │   ├── Blacklist.ts
│       │   ├── Book.ts
│       │   ├── Favourites.ts
│       │   ├── Reviews.ts
│       │   └── User.ts
│       ├── routes/        → Express routers
│       │   ├── adminRoutes.ts
│       │   ├── booksRoutes.ts
│       │   └── usersRoutes.ts
│       ├── services/     → Helpers
│       │   ├── seedBook.ts
│       │   └── tokenGeneration.ts
│       ├── types/        → Type augmentations
│       │   └── express.d.ts
│       └── server.ts     → App entry point
│
├── frontend/              → React SPA
│   ├── public/
│   ├── src/
│   │   ├── api/           → axiosInstance.ts
│   │   ├── components/    → Navbar, ToggleThemes, etc.
│   │   ├── context/       → AuthProvider
│   │   ├── hooks/          → UseAuth, UseAxiosPrivate
│   │   ├── pages/         → Books, Favourites, Reviews, Login, Signup, etc.
│   │   └── utils/         → fetchCover, interfaces, normalizeCategories
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── package.json           → Root scripts (concurrently)
└── README.md              → This file
```

## 🚀 Tech Stack

### Backend

- **Server:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose
- **Cache / Sessions:** Redis (refresh tokens)
- **Auth:** JWT (access + refresh), httpOnly cookies
- **Validation:** Express-validator
- **Language:** TypeScript

### Frontend

- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **HTTP:** Axios (with interceptors, credentials)

## 🔐 Security & Validation

- **Input validation:** Express-validator on signup, login, reviews
- **Auth:** JWT access token + refresh token in httpOnly cookie
- **Roles:** user, admin, super admin with protected routes
- **Error handling:** Centralized responses and status codes
- **Type safety:** TypeScript across backend and frontend

## 📦 API Endpoints

### Books

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | /api/books       | Get all books    |
| GET    | /api/books/:olid | Get book by OLID |

### Users (Auth & Profile)

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| POST   | /api/users/signup  | Register             |
| POST   | /api/users/login   | Login                |
| DELETE | /api/users/logout  | Logout               |
| GET    | /api/users/refresh | Refresh access token |

### Favourites (auth required)

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | /api/users/favourites         | Get user's favourites  |
| GET    | /api/users/favouritesIds      | Get favourite book IDs |
| POST   | /api/users/favourites/:bookId | Add to favourites      |
| DELETE | /api/users/favourites/:bookId | Remove from favourites |

### Reviews

| Method | Endpoint                   | Description                       |
| ------ | -------------------------- | --------------------------------- |
| GET    | /api/users/reviews/:bookId | Get reviews for book              |
| GET    | /api/users/myreviews       | Get current user's reviews (auth) |
| POST   | /api/users/reviews/:bookId | Add review (auth)                 |
| PUT    | /api/users/reviews/:bookId | Update review (auth)              |
| DELETE | /api/users/reviews/:bookId | Delete review (auth)              |

### Admin (admin role)

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| GET    | /api/admin/blacklist           | Get blacklisted books |
| POST   | /api/admin/books/:bookOlid     | Blacklist a book      |
| DELETE | /api/admin/blacklist/:bookOlid | Remove from blacklist |
| DELETE | /api/admin/reviews/:reviewId   | Remove a review       |

### Super Admin

| Method | Endpoint                         | Description      |
| ------ | -------------------------------- | ---------------- |
| PUT    | /api/admin/users/promote/:userId | Promote to admin |
| PUT    | /api/admin/users/demote/:userId  | Demote admin     |

### Request body examples

**Signup**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Login**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Review (POST/PUT)**

```json
{
  "rate": 5,
  "content": "Great book!"
}
```

## 💡 Features

- ✅ Browse books with search/filter
- ✅ Seeded with 5000 books fetched from the Open Library API
- ✅ When you search a book that's not in the database, it is fetched on-demand from the Open Library API and saved
- ✅ User signup & login with JWT (access + refresh)
- ✅ Favourite books and view favourites list
- ✅ Add, edit, and delete reviews with rating
- ✅ Admin: blacklist books, remove reviews
- ✅ Super admin: promote/demote admins
- ✅ Role-based access control
- ✅ MongoDB + Redis integration
- ✅ Input validation and error handling
- ✅ Responsive UI with Tailwind CSS
- ✅ Dark/light theme toggle

## 🛠️ Scripts

```bash
# Install all dependencies (root)
npm install

# Run frontend + backend + backend lint (from root)
npm run dev

# Backend only
cd backend && npm install && npm run dev

# Frontend only
cd frontend && npm install && npm run dev

# Backend production build & start
cd backend && npm run build && npm start
```

## 📊 Data Models

### Book

- `olid` (String, required, unique)
- `title`, `author_name` (String, required)
- `description`, `categories` (Array of strings)
- `cover_i`, `isbns`, `primaryEditionOlid` (optional)

### User

- `username` (String, required, 3–20 chars, unique, lowercase)
- `email` (String, required, unique, lowercase)
- `password` (String, hashed with bcrypt)
- `role`: `'user' | 'admin' | 'super admin'`

### Review

- `userId`, `bookId` (ObjectId)
- `rate` (Number, 1–5)
- `content` (String, optional)

## ☁️ Deployment

- **Backend:** Render (Node, set root to `backend`, build: `npm run build`, start: `npm start`)
- **Frontend:** Vercel (root: `frontend`, build: `npm run build`, output: `dist`)
- **Database:** MongoDB Atlas
- **Redis:** Railway Redis for refresh tokens

Set `CLIENT_URL` and `VITE_API_URL` to your frontend and API URLs in production.

## 👤 Author

Made by **Abdulrahman Khatib**

## 📝 License

This project is licensed under the ISC License.
