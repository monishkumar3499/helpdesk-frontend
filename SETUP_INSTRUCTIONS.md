# Helpdesk Application - Setup Instructions

This document provides necessary instructions to pull, build, and run the Helpdesk frontend and backend applications on a new machine.

## Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL (for the backend database)
- Git (if pulling from a repository)

---

## 🚀 Backend Setup

1. **Navigate to the Backend Directory:**
   ```bash
   cd helpdesk-backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root of the backend directory.
   - Example configuration:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk_db?schema=public"
     JWT_SECRET="your_super_secret_jwt_key"
     PORT=3001
     ```

4. **Initialize Database:**
   Ensure PostgreSQL is running, then populate the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Optional)* Seed the database if applicable:
   ```bash
   npm run seed
   ```

5. **Run the Backend System:**
   - **Development Mode:** `npm run start:dev`
   - **Production Mode:** `npm run build && npm run start:prod`
   - The backend runs on `http://localhost:3001`

---

## 🌐 Frontend Setup

1. **Navigate to the Frontend Directory:**
   ```bash
   cd helpdesk-frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env.local` or `.env` file containing backend endpoints.
   - Required variable matches:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:3001
     ```

4. **Run the Frontend Application:**
   - **Development Mode:** `npm run dev`
   - **Production Mode:** `npm run build && npm start`
   - The frontend aligns perfectly with modern browsers at `http://localhost:3000`

---

## 🐳 Docker Setup (Optional but Recommended)

Both components have production-ready `.dockerfile` templates.

**For backend:**
```bash
docker build -t helpdesk-backend -f .dockerfile .
docker run -p 3001:3001 helpdesk-backend
```

**For frontend:**
```bash
docker build -t helpdesk-frontend -f .dockerfile .
docker run -p 3000:3000 helpdesk-frontend
```

*Ensure the container endpoints and `.env` map appropriately when deploying Docker instances interacting with each other on virtual local networks.*
