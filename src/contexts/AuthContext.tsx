"use client";
import { api } from "@/services/api";
import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { useRouter } from "next/navigation";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SigInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SigInCredentials): Promise<void>;
  user: User | null;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode; // pode receber qualquer coisa dentro dele
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null); // armazenar dados do usuário
  const isAuthenticated = !!user;
  const router = useRouter();

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SigInCredentials) {
    try {
      //realizar o login do usuário/autenticação
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      // Aramazenar o token no cookie
      setCookie(undefined, "nextauth.token", token, {
        //tempo de armazenamento do cookie
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        // A parte da aplicação terá acesso ao token
        path: "/",
      });

      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        //tempo de armazenamento do cookie
        maxAge: 60 * 60 * 24 * 30, //30 dias
        // Que parte da aplicação terá acesso ao token
        path: "/",
      });

      setUser({ email, permissions, roles });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      router.push("/dashboard");
      console.log(response.data);
    } catch (error) {
      console.log("Erro na captura dos dados", error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
