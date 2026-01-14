# Hovarlay Technical Assessment

This is a monorepo for my technical assessment for Hovarlay, a full-stack product search application built with TypeScript, Express.js, React, and PostgreSQL.

## Prerequisites

- Node.js v24.0+
- PostgreSQL

## Setup

### 1. Database

Make sure PostgreSQL is installed and running on your machine.

```bash
# Linux (systemd)
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create the database:

```bash
sudo -iu postgres psql
```

```sql
CREATE DATABASE hovarlay_db;
ALTER USER postgres WITH PASSWORD 'your_password';
\q
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env` with your password.

Run migrations and seed the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the server:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
