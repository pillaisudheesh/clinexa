# Platform Administrator setup

Clinexa now distinguishes platform-wide authority from clinic-scoped role codes. A role named `SUPER_ADMIN` or `SUPER_ADMINISTRATOR` inside a clinic does **not** grant platform administration.

## Apply the database migration

From the `api` directory, run this against the intended database:

```bash
npx prisma migrate deploy
npx prisma generate
```

The migration adds `User.isPlatformAdmin`, which defaults to `false` for every existing account.

## Promote the initial platform administrator

Choose an existing, active user account that should control the whole Clinexa platform, then run:

```bash
npm run db:promote-platform-admin -- admin@example.com
```

Replace the example email with the exact email of the approved account. The script fails if the user does not exist or is inactive. It does not promote users based on their clinic role name.

The promoted user should sign out and sign in again. Platform status is loaded from the database during authentication, and protected clinic-management endpoints also verify it against the database on each request.

## Security behavior

- Only an active user with `isPlatformAdmin = true` can create, list, update, activate, or deactivate clinics through `/clinics` endpoints.
- A clinic role named `SUPER_ADMIN` is not sufficient to call those endpoints.
- Clinic role permissions remain clinic-scoped; platform status is a separate persisted user attribute.
- Do not expose `isPlatformAdmin` as a self-service profile field. Promotion should be performed only by a trusted database/operator workflow.

## Verify

1. Sign in as a clinic user whose role code is `SUPER_ADMIN`; requests to `PATCH /clinics/:id/status` must return `403`.
2. Sign in as the designated platform administrator; the same endpoint should pass authorization if the request body is valid.
3. Run the API build and guard tests after installing dependencies.
