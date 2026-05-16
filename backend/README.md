# School Backend (Express + Prisma)

This backend provides a simple Students CRUD API using Postgres + Prisma.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.

2. Install dependencies:

```bash
cd backend
npm install
```

3. Generate Prisma client and run migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start server in dev mode:

```bash
npm run dev
```

Default server: `http://localhost:4000`.

## API endpoints

- `GET /students` — list students
- `GET /students/:id` — get student
- `POST /students` — create student (JSON body: `firstName`, `lastName`, `email`, `dob`, `studentClass`, `roll`, `parentName`, `phone`)
- `PUT /students/:id` — update student
- `DELETE /students/:id` — delete student

## Notes

- Uses Postgres by default. Set `DATABASE_URL` to your database.
- To use SQLite for quick testing, update `prisma/schema.prisma` datasource to `provider = "sqlite"` and set `url = "file:./dev.db"`.

If you want, I can integrate the frontend `StudentManagement.jsx` to call this API next.
