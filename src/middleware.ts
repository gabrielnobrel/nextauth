import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { protectedRoutes } from "./utils/protectedRoutes";
import { jwtDecode } from "jwt-decode";
import { validateUserPermissions } from "./utils/validateUserPermissions";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("nextauth.token")?.value;
  const { pathname } = request.nextUrl;

  // Verifica se a rota atual está na lista de rotas protegidas
  const routeConfig = protectedRoutes[pathname];

  if (routeConfig) {
    if (!token) {
      // Redireciona para a página inicial se o usuário não estiver autenticado
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      // Decodifica o token JWT
      const decodedToken = jwtDecode<{
        permissions: string[];
        roles: string[];
      }>(token);

      const user = {
        permissions: decodedToken.permissions || [],
        roles: decodedToken.roles || [],
      };

      // Verifica se o usuário tem permissão para acessar a rota
      const hasAccess = validateUserPermissions({
        user,
        permissions: routeConfig.permissions,
        roles: routeConfig.roles,
      });

      if (!hasAccess) {
        // Redireciona para uma página de "não autorizado" se o usuário não tiver permissão
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      // Redireciona para a página inicial em caso de erro ao decodificar o token
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Permite o acesso à rota
  return NextResponse.next();
}

// Aplica o middleware a todas as rotas
export const config = {
  matcher: "/:path*", // Aplica o middleware a todas as rotas
};
