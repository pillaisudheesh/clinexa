-- Platform-wide clinic visibility and lifecycle access are controlled by
-- User.isPlatformAdmin and PlatformAdminGuard, not clinic role permissions.
-- Remove any legacy mappings so clinic roles cannot expose the platform Clinics navigation.
DELETE FROM "RolePermission" rp
USING "Permission" p
WHERE rp."permissionId" = p."id"
  AND p."code" IN (
    'CLINIC_READ',
    'CLINIC_CREATE',
    'CLINIC_UPDATE',
    'CLINIC_DELETE'
  );
