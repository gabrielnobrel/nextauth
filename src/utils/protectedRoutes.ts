export const protectedRoutes: Record<
  string,
  { permissions: string[]; roles: string[] }
> = {
  "/metrics": {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  },
};
