# clinexa

Clinic Management System

# steps to update prisma

npx prisma format
npx prisma validate
npx prisma migrate dev --name role-improvements
npx primsa studio

{
"email": "admin@clinexa.com",
"password": "Admin@123"
}
npx prisma db seed

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
