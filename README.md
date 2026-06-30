# Acquisitions

## Local development with Neon Local

This project uses Neon Local for local Postgres compatibility while developing.

### Prerequisites

- Docker Desktop or Docker Engine installed
- `NEON_API_KEY` and `NEON_PROJECT_ID` set in your shell or local environment
- `PARENT_BRANCH_ID` optional to create ephemeral branches from an existing Neon branch

### Start locally

1. Create or update `.env.development`:

```env
DATABASE_URL="postgres://user:password@neon-local:5432/dbname"
PORT=3000
```

2. Run Neon Local and the app together:

```bash
docker compose -f docker-compose.dev.yml up --build
```

3. Open your app:

```bash
http://localhost:3000
```

### How local Neon works

- `neon-local` service runs the Neon Local Docker proxy
- The app uses `DATABASE_URL` pointing at `neon-local:5432`
- `NEON_LOCAL=true` enables Neon Local client settings in `src/config/database.js`
- Neon Local creates ephemeral branches automatically when `PARENT_BRANCH_ID` is provided

## Production deployment

Production uses a real Neon Cloud connection string and does not run Neon Local.

### Configure production secrets

Create `.env.production` with your Neon Cloud URL:

```env
DATABASE_URL="postgres://<user>:<password>@<project>.neon.tech/<database>"
PORT=3000
```

### Start production container

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Production notes

- `docker-compose.prod.yml` only starts the app service
- No local Neon proxy is started in production
- Secrets are injected through `.env.production` or environment variables

## Environment switching

- `NODE_ENV=development` loads `.env.development`
- `NODE_ENV=production` loads `.env.production`
- `NEON_LOCAL=true` enables Neon Local HTTP proxy mode in `src/config/database.js`

## Optional environment variables

- `NEON_API_KEY` - required for Neon Local
- `NEON_PROJECT_ID` - required for Neon Local
- `PARENT_BRANCH_ID` - optional, if you want an ephemeral database branch based on a parent branch
- `NEON_LOCAL_HOST` - service host within Docker Compose, defaults to `neon-local`
