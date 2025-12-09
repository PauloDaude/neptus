/**
 * Decodifica um JWT e retorna o payload
 * @param token - Token JWT
 * @returns Payload decodificado ou null se inválido
 */
export function decodeJWT<T = unknown>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

/**
 * Interface do payload do JWT
 */
export interface JWTPayload {
  sub: string; // ID do usuário
  nome: string;
  email: string;
  isAdmin: boolean;
  perfil: string;
  permissoes: string[];
  exp: number;
  iat: number;
}

/**
 * Obtém o ID do usuário do token JWT armazenado
 * @returns ID do usuário ou null
 */
export function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  const payload = decodeJWT<JWTPayload>(token);
  return payload?.sub || null;
}
