import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Usage : @Roles('ADMIN') sur une route protégée par RolesGuard
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
