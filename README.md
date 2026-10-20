# samaroot

Clinic Management System

# steps to update prisma

npx prisma format
npx prisma validate
npx prisma migrate dev --name role-improvements
npx primsa studio

## Local environment setup

Create `api/.env` from `api/.env.example`, set `DATABASE_URL`, and generate a unique JWT secret:

```bash
cd api
cp .env.example .env
openssl rand -base64 48
```

Put the generated value in `JWT_SECRET`. Do not commit `.env` files. Before running `npm run db:seed`, set `PLATFORM_ADMIN_EMAIL` and a unique `PLATFORM_ADMIN_PASSWORD` of at least 16 characters in `api/.env`. The seed script will reject missing or weak credentials. If upgrading a database created by the old seed, the legacy `admin@samaroot.com` account is disabled when you configure a different administrator email.

```bash
npm run db:seed
```

{
"code": "CLN001",
"name": "Sunrise Multispeciality Hospital",
"email": "admin@sunrisehospital.com",
"phone": "+1-555-123-4567",
"website": "https://www.sunrisehospital.com",
"addressLine1": "1200 Medical Center Drive",
"addressLine2": "Building A",
"city": "Chicago",
"state": "Illinois",
"country": "USA",
"postalCode": "60601",
"timezone": "America/Chicago"
}

npx prisma format
npx prisma migrate dev --name add_clinical_appointments
npx prisma generate
