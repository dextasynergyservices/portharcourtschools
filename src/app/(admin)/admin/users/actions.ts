"use server";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db, users, verificationTokens } from "@/lib/db";
import { sendUserInviteEmail } from "@/lib/email";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Super Admin check helper.
 */
async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized. Please log in.");
  }
  if (session.user.role !== "super_admin") {
    throw new Error(
      "Permission denied. Only Super Administrators can manage users.",
    );
  }
  return session.user;
}

/**
 * Invite a new team member.
 * Dispatches an email via Resend if configured, and returns the direct invite link
 * so the admin can copy it immediately without being blocked.
 */
export async function inviteUserAction(params: {
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor" | "creator";
}) {
  const currentUser = await requireSuperAdmin();
  const cleanEmail = params.email.toLowerCase().trim();

  // 1. Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      error: `A user with email "${cleanEmail}" already exists.`,
    };
  }

  // 2. Create inactive user record
  const [newUser] = await db
    .insert(users)
    .values({
      name: params.name.trim(),
      email: cleanEmail,
      role: params.role,
      status: "inactive", // Activated once password is set
    })
    .returning();

  // 3. Create verification token (48-hour expiration)
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Clear any existing tokens for this email
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, cleanEmail));

  await db.insert(verificationTokens).values({
    identifier: cleanEmail,
    token,
    expires,
  });

  // 4. Construct secure invite URL
  const baseUrl = getBaseUrl();
  const setPassLink = `${baseUrl}/admin/set-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

  // 5. Send Invite Email (Graceful degradation if Resend is unset)
  const emailRes = await sendUserInviteEmail({
    to: cleanEmail,
    name: params.name.trim(),
    role: params.role,
    inviterName: currentUser.name || "A Super Admin",
    setPassLink,
    expiresInHours: 48,
  });

  revalidatePath("/admin/users");

  return {
    success: true,
    user: newUser,
    inviteUrl: setPassLink,
    emailSent: emailRes.success && !emailRes.isSimulated,
  };
}

/**
 * Change a team member's role (Super Admin only).
 */
export async function updateUserRoleAction(params: {
  userId: string;
  newRole: "super_admin" | "admin" | "editor" | "creator";
}) {
  const currentUser = await requireSuperAdmin();

  // Self-demotion guard
  if (currentUser.id === params.userId && params.newRole !== "super_admin") {
    return {
      success: false,
      error: "You cannot remove your own Super Administrator privileges.",
    };
  }

  try {
    await db
      .update(users)
      .set({ role: params.newRole })
      .where(eq(users.id, params.userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update role.";
    return { success: false, error: message };
  }
}

/**
 * Toggle user active/inactive status (Super Admin only).
 */
export async function toggleUserStatusAction(params: {
  userId: string;
  newStatus: "active" | "inactive";
}) {
  const currentUser = await requireSuperAdmin();

  if (currentUser.id === params.userId) {
    return {
      success: false,
      error: "You cannot deactivate your own account.",
    };
  }

  try {
    await db
      .update(users)
      .set({ status: params.newStatus })
      .where(eq(users.id, params.userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to toggle status.";
    return { success: false, error: message };
  }
}

/**
 * Delete a user from the workspace (Super Admin only).
 */
export async function deleteUserAction(userId: string) {
  const currentUser = await requireSuperAdmin();

  if (currentUser.id === userId) {
    return {
      success: false,
      error: "You cannot delete your own account.",
    };
  }

  try {
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Clean up tokens
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, targetUser.email));

    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete user.";
    return { success: false, error: message };
  }
}

/**
 * Resend invite to an invited user.
 */
export async function resendInviteAction(userId: string) {
  const currentUser = await requireSuperAdmin();

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, targetUser.email));

  await db.insert(verificationTokens).values({
    identifier: targetUser.email,
    token,
    expires,
  });

  const baseUrl = getBaseUrl();
  const setPassLink = `${baseUrl}/admin/set-password?token=${token}&email=${encodeURIComponent(targetUser.email)}`;

  const emailRes = await sendUserInviteEmail({
    to: targetUser.email,
    name: targetUser.name || "Team Member",
    role: targetUser.role,
    inviterName: currentUser.name || "A Super Admin",
    setPassLink,
    expiresInHours: 48,
  });

  return {
    success: true,
    inviteUrl: setPassLink,
    emailSent: emailRes.success && !emailRes.isSimulated,
  };
}

/**
 * Set password for an invited user using verification token.
 */
export async function setPasswordAction(params: {
  email: string;
  token: string;
  password: string;
}) {
  const cleanEmail = params.email.toLowerCase().trim();

  // Validate token
  const [validToken] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, cleanEmail),
        eq(verificationTokens.token, params.token),
        gt(verificationTokens.expires, new Date()),
      ),
    )
    .limit(1);

  if (!validToken) {
    return {
      success: false,
      error:
        "This invitation link is invalid or has expired. Please contact an administrator to request a new link.",
    };
  }

  if (params.password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  try {
    const passwordHash = await bcrypt.hash(params.password, 10);

    // Update user password and activate
    await db
      .update(users)
      .set({
        passwordHash,
        status: "active",
      })
      .where(eq(users.email, cleanEmail));

    // Delete used token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, cleanEmail),
          eq(verificationTokens.token, params.token),
        ),
      );

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to set password.";
    return { success: false, error: message };
  }
}
