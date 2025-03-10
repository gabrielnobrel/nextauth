type User = {
  permissions: string[];
  roles: string[];
};

type ValidateUserPermissionsParams = {
  user: User | null;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  if (permissions && permissions?.length > 0) {
    const hasAllPermissions = permissions.every((permission) => {
      // Vai retornar caso o usuário possua todas as permissões passados no array permissions
      return user?.permissions.includes(permission);
    });
    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles && roles?.length > 0) {
    // Verificar se o usuário possui todas as roles passadas no array roles
    const hasAllRoles = roles.some((role) => {
      return user?.roles.includes(role);
    });
    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}
