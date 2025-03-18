import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { protectedRoutes } from "./utils/protectedRoutes";
import { jwtDecode } from "jwt-decode";
import { validateUserPermissions } from "./utils/validateUserPermissions";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("nextauth.token")?.value;
  const { pathname } = request.nextUrl;

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const routeConfig = protectedRoutes[pathname as keyof typeof protectedRoutes];

  if (routeConfig && token) {
    try {
      const decodedToken = jwtDecode<{
        permissions: string[];
        roles: string[];
      }>(token);

      const user = {
        permissions: decodedToken.permissions || [],
        roles: decodedToken.roles || [],
      };

      // Usa a função validateUserPermissions para verificar se o usuário tem acesso
      const hasAccess = validateUserPermissions({
        user,
        permissions: routeConfig.permissions,
        roles: routeConfig.roles,
      });

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Aplica o middleware apenas para as rotas protegidas
export const config = {
  matcher: Object.keys(protectedRoutes),
};
