import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("nextauth.token")?.value;

  // Se o token não existir e o usuário não estiver na página de login, redireciona para login
  if (!token && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se o usuário estiver autenticado e tentar acessar a home ("/"), redireciona para o dashboard
  if (token && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se o usuário NÃO estiver autenticado e tentar acessar o dashboard, redireciona para a home
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Aplica o middleware apenas nessas rotas
export const config = {
  matcher: ["/", "/dashboard", "/login"], // Protege as páginas home, dashboard e login
};
