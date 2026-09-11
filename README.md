# FineAnswer – Study Abroad

A full-stack web application for study abroad consultancy, helping students explore universities, manage their applications, and access expert guidance for studying overseas.

## Project Structure

```
FineAnswer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components & admin
│   │   ├── Firebase/       # Firebase config
│   │   ├── services/       # API clients
│   │   └── utils/          # Helpers (e.g. Cloudinary)
│   └── vite.config.js
├── server/                 # Express backend
│   └── index.js            # API routes & logic
└── README.md
```

## Features

### Public

- **Landing page** – Hero, services, countries, success stories, contact
- **Country pages** – Australia, UK, Ireland
- **Blog** – Public blog
- **Contact** – Contact form/section

### User (student)

- **Auth** – Email/password & Google Sign-In
- **Forgot password** – OTP via email
- **Dashboard** – Overview, universities, documents, sessions, messages
- **Profile** – Personal info, education, language test scores (editable)
- **Progress tracker** – Visa/application progress

### Admin

- **Dashboard** – Overview
- **Analytics** – Metrics
- **Success stories** – Add/edit stories shown on landing page
- **Blog** – Manage blog posts
- **Career** – Career-related content
- **Tracker update** – Update students’ progress
- **Sessions** – Manage sessions
- **Students Info** – View registered students (cards + details)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project (for Google Sign-In)

### 1. Clone & Install

```bash
git clone <repository-url>
cd FineAnswer

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Environment Variables

**Server (`server/.env`)**

```env
DB_USER=your_mongodb_user
DB_PASSWORD=your_mongodb_password
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@yourdomain.com

# For forgot-password emails
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=FineAnswer <your-email@gmail.com>
```

**Client (`client/.env` or `client/.env.local`)**

```env
VITE_APIKEY=...
VITE_AUTHDOMAIN=...
VITE_PROJECTID=...
VITE_STORAGEBUCKET=...
VITE_MESSAGINGSENDERID=...
VITE_APPID=...
VITE_MEASUREMENTID=...
```

### 3. Run

```bash
# Terminal 1 – backend
cd server && npm run dev

# Terminal 2 – frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: https://fine-answer.vercel.app

### 4. Build for production

```bash
cd client && npm run build
cd ../server && npm start
```

## API Overview

| Method | Endpoint                          | Description             |
| ------ | --------------------------------- | ----------------------- |
| POST   | `/api/auth/login`                 | Email/password login    |
| POST   | `/api/auth/google`                | Google OAuth login      |
| GET    | `/api/auth/me`                    | Current user (auth)     |
| POST   | `/api/auth/forgot-password`       | Request OTP             |
| POST   | `/api/auth/reset-password`        | Reset password with OTP |
| POST   | `/api/users`                      | Register                |
| PUT    | `/api/users/me/profile`           | Update profile (auth)   |
| GET    | `/api/users`                      | List users (admin)      |
| GET    | `/api/users/me/progress-tracker`  | Own progress (auth)     |
| PUT    | `/api/users/:id/progress-tracker` | Update progress (admin) |
| GET    | `/api/success-stories`            | Public success stories  |
| POST   | `/api/success-stories`            | Create story (admin)    |
| DELETE | `/api/success-stories/:id`        | Delete story (admin)    |

## Scripts

| Location | Command         | Description           |
| -------- | --------------- | --------------------- |
| client   | `npm run dev`   | Start Vite dev server |
| client   | `npm run build` | Production build      |
| server   | `npm run dev`   | Start with nodemon    |
| server   | `npm start`     | Start production      |

## License

ISC
