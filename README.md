# Reservini

## Database setup

The backend uses PostgreSQL. Set `DATABASE_URL` in `backend/.env` before running Prisma commands.

To seed products, run `npm run db:seed` from `backend`. To also create or reset an admin in a new database, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend environment first. Seeding promotes an existing account with that email and sets its password to `ADMIN_PASSWORD`. Do not commit credentials.

The card-only studio starts at five cards and the API enforces the same minimum. The studio lets customers choose the card orientation, template, branding, and layout before adding a design to their cart.