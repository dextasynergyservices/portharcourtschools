"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid email or password. Please check your credentials.",
          };
        default:
          return { error: "Authentication failed. Please try again later." };
      }
    }
    // Re-throw redirect errors so Next.js can handle the navigation
    throw error;
  }
}
