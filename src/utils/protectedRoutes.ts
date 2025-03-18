export const protectedRoutes: Record<
  string,
  { permissions: string[]; roles: string[] }
> = {
  "/metrics": {
    permissions: ["metrics.list3"],
    roles: ["administrator"],
  },
};
