export class AuthTokenError extends Error {
  constructor() {
    super("Falha ao autenticar o token.");
  }
}
