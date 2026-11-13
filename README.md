# Reservini

## Database setup

The backend uses PostgreSQL. Set `DATABASE_URL` in `backend/.env` before running Prisma commands.

To seed products, run `npm run db:seed` from `backend`. To also create an admin in a new database, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend environment first. If that email already exists, seeding promotes the account to admin without changing its password. Do not commit credentials.