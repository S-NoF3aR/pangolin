export function ensureOfflineAccessScope(scopes: string): string {
    const parts = scopes
        .split(/\s+/)
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0);
    if (!parts.includes("offline_access")) {
        parts.push("offline_access");
    }
    return parts.join(" ");
}
