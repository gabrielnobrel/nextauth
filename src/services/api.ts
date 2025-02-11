import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

interface APIErrorResponse {
  code?: string;
  error?: boolean;
  message?: string;
}

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}[] = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const errorData = error.response.data as APIErrorResponse;
      const originalConfig = error.config;

      if (errorData.code === "token.expired" && originalConfig) {
        cookies = parseCookies();
        const { "nextauth.refreshToken": refreshToken } = cookies;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", { refreshToken })
            .then((response) => {
              const { token, refreshToken: newRefreshToken } = response.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
              });

              setCookie(undefined, "nextauth.refreshToken", newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
              });

              api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

              failedRequestsQueue.forEach((request) =>
                request.onSuccess(token)
              );
              failedRequestsQueue = [];
            })
            .catch((err) => {
              failedRequestsQueue.forEach((request) => request.onFailure(err));
              failedRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              if (originalConfig.headers) {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
              }
              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => reject(err),
          });
        });
      } else {
        // Logout do usuário caso o erro não seja "token.expired"
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
