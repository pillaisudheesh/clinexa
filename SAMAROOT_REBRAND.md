# SamaRoot Rebrand

The application has been rebranded from **Clinexa** to **SamaRoot**.

## Updated
- User-facing product name and messaging
- Frontend title/meta description
- Login, navigation, header, sidebar and loading text
- Brand component and SVG asset filenames
- Tailwind/CSS brand token names (`clinexa-*` -> `samaroot-*`)
- API/Swagger product title and description
- Demo seed clinic/email/domain branding
- Documentation and architecture/product references
- Demo/local-storage branding keys

## Intentionally preserved for compatibility
- Existing PostgreSQL Docker container/user/database/password identifiers
- Existing JWT fallback secret
- API routes and contracts
- Prisma model names
- Internal technical identifiers where changing them could break existing data or runtime compatibility

This keeps the rebrand focused on the product identity without forcing a database/auth migration.
