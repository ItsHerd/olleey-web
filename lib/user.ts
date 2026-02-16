export const DEV_FALLBACK_USER_ID = "096c8549-ce41-4b94-b7f7-25e39eb7578b";

export function resolveClientUserId(authUserId?: string | null): string | undefined {
  if (authUserId) return authUserId;

  if (typeof window !== "undefined") {
    const fromStorage = localStorage.getItem("userId");
    if (fromStorage) return fromStorage;
  }

  return process.env.NEXT_PUBLIC_DEV_USER_ID || DEV_FALLBACK_USER_ID;
}
