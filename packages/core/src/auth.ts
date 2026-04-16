export interface AuthProvider {
  getAuthorization(req: { url: string; method: string }): Promise<string | undefined> | string | undefined;
  onUnauthorized?(): Promise<void> | void;
}

export interface StaticAuth {
  type: "bearer" | "basic";
  credentials: string;
}

export type AuthConfig = AuthProvider | StaticAuth;

export function isStaticAuth(auth: AuthConfig): auth is StaticAuth {
  return typeof (auth as StaticAuth).type === "string" && typeof (auth as StaticAuth).credentials === "string";
}

export function resolveAuthProvider(auth: AuthConfig | undefined): AuthProvider | undefined {
  if (!auth) return undefined;
  if (isStaticAuth(auth)) {
    const header = auth.type === "bearer" ? `Bearer ${auth.credentials}` : `Basic ${auth.credentials}`;
    return { getAuthorization: () => header };
  }
  return auth;
}
