import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';
import { PermissionGroupsController } from './permission-groups.controller';

describe('PermissionGroupsController', () => {
  it('requires the database-backed PlatformAdminGuard', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      PermissionGroupsController,
    ) as unknown[];

    expect(guards).toContain(PlatformAdminGuard);
  });
});
