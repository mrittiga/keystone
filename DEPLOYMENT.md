# Production Deployment Checklist

## Required environment

Set these in a secret manager or deployment environment, never in source control:

```text
DB_HOST=<managed-postgres-host>
DB_PORT=5432
DB_NAME=keystone_db
DB_USER=<least-privileged-db-user>
DB_PASSWORD=<strong-random-password>
JWT_SECRET=<random-secret-at-least-32-characters>
JWT_EXPIRY=86400000
CORS_ALLOWED_ORIGINS=https://app.example.com
```

Do not use the local `postgres` account or the values in `.env` in production. Rotate any credentials that were ever committed or shared.

## HTTPS

Terminate TLS at the load balancer or reverse proxy and forward only HTTPS traffic to Spring Boot. Redirect HTTP to HTTPS, enable HSTS after verification, and set secure, HTTP-only cookies if cookie authentication is introduced. The frontend must be built with the production API origin and served from the HTTPS origin listed in `CORS_ALLOWED_ORIGINS`.

## Database and migrations

Run Flyway migrations as part of the release against a backup or staging clone first. Use a managed PostgreSQL instance with automated daily backups, point-in-time recovery, retention, encryption at rest, and a tested restore procedure. Keep application credentials least-privileged and separate from migration credentials.

## Monitoring

Collect structured application logs, HTTP 5xx rate, request latency, JVM memory/CPU, database connection pool usage, Flyway migration failures, and authentication failures. Add uptime checks for `/actuator/health` after enabling Spring Boot Actuator and protect management endpoints behind the internal network or an authenticated monitor.

## Customer interactions

Feedback and chat messages are persisted by the backend. Chat requests fail closed unless `CHAT_PROVIDER_URL` and `CHAT_PROVIDER_API_KEY` are configured; the provider must return `{ "reply": "..." }` and must enforce prompt/data retention policy.

Payments fail closed unless a real payment adapter and webhook are implemented. Never mark a payment `PAID` from a browser request. Create a provider checkout session, verify the signed webhook server-side, then update the payment row idempotently.

Photo metadata is persisted, but browser uploads must use a server-issued, short-lived signed upload URL to private object storage. Validate content type and size server-side, scan uploads for malware, encrypt at rest, and serve downloads through signed URLs. Do not accept arbitrary storage keys from clients.

## Release gates

```powershell
cd frontend
npm ci
npm run build
npm run lint

cd ..\backend
mvn test
mvn package
```

Deploy only when all commands pass, migrations have been reviewed, a restore has been tested, and the production secrets/CORS/HTTPS values have been supplied by the hosting environment.
