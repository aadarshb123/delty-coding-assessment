# Patient Call Log

A full-stack web application for healthcare staff to log and manage patient phone calls.

## Tech Stack

- Frontend: React 19, TypeScript, Tailwind CSS, Vite
- Backend: Express 5, TypeScript
- Database: PostgreSQL (Supabase)
- Auth: Firebase Authentication
- Deployment: AWS Elastic Beanstalk

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase account)
- Firebase project

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories.

Backend (`backend/.env`):
```
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3001
FIREBASE_PROJECT_ID=your-firebase-project-id
```

Frontend (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Database Setup

Run the schema in your PostgreSQL database:

```bash
psql $DATABASE_URL -f backend/src/db/schema.sql
```

Or execute the contents of `backend/src/db/schema.sql` in your Supabase SQL editor.

### Running Locally

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173 and the backend on http://localhost:3001.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /health/db | Database health check |
| GET | /api/call-logs | List call logs (paginated) |
| GET | /api/call-logs/:id | Get single call log |
| POST | /api/call-logs | Create call log |
| PUT | /api/call-logs/:id | Update call log |
| DELETE | /api/call-logs/:id | Delete call log |

All `/api/*` routes require a valid Firebase ID token in the Authorization header.

## Deployment

The application is deployed on AWS:
- Backend: Elastic Beanstalk
- Database: Supabase (managed PostgreSQL)
- Auth: Firebase (managed)

## Project Structure

```
├── backend/
│   └── src/
│       ├── db/           # Database connection and schema
│       ├── lib/          # Firebase admin setup
│       ├── middleware/   # Auth middleware
│       ├── repositories/ # Data access layer
│       ├── routes/       # API routes
│       └── types/        # TypeScript types
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── contexts/     # Auth context
│       ├── pages/        # Page components
│       ├── services/     # API client
│       └── types/        # TypeScript types
```
