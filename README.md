
  # Set School Name

  This is a code bundle for Set School Name. The original project is available at https://www.figma.com/design/7cq6FF08WuBRIyCI9P6cgN/Set-School-Name.

  ## Running the code

  Run `npm i` to install the dependencies.

  Frontend setup:

  1. Ensure `.env` contains:
     `VITE_API_BASE_URL=/api`
     `VITE_API_PROXY_TARGET=http://localhost:4000`
  2. Run `npm run dev` to start the frontend development server.

  Backend setup:

  1. In `backend/`, copy `.env.example` to `.env` and set `DATABASE_URL`.
  2. Install backend dependencies with `npm install`.
  3. Run Prisma setup:
     `npx prisma generate`
     `npx prisma migrate dev --name init`
  4. Start the backend with `npm run dev`.

  With both servers running, the frontend will call the backend through the Vite `/api` proxy.
  
