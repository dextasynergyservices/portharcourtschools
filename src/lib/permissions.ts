export type UserRole = "super_admin" | "admin" | "editor" | "creator";

/**
 * Checks whether a user role has permission to manage team accounts,
 * invite new members, or modify roles.
 * Only Super Administrators have this permission.
 */
export function canManageUsers(role?: string | null): boolean {
  return role === "super_admin";
}

/**
 * Checks whether a user role has permission to delete key entities
 * (schools, blog posts, events, programmes, media).
 * Creators are strictly prevented from deleting published or existing resources.
 */
export function canDeleteResource(role?: string | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "admin" || role === "editor";
}

/**
 * Checks whether a user role can directly publish content live
 * without editorial review.
 */
export function canPublishContent(role?: string | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "admin" || role === "editor";
}

/**
 * Checks whether a user role can modify global site settings.
 */
export function canManageSettings(role?: string | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "admin";
}

/**
 * Checks whether a user role can create or edit resources in draft/live.
 */
export function canEditResource(role?: string | null): boolean {
  if (!role) return false;
  return (
    role === "super_admin" ||
    role === "admin" ||
    role === "editor" ||
    role === "creator"
  );
}
