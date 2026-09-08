interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Cloudflare Turnstile token on the server side.
 * If TURNSTILE_SECRET_KEY is not configured (e.g. in local dev),
 * verification gracefully succeeds so local development is never blocked.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development or when key is not provided, allow pass-through
  if (!secretKey) {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error:
        "Spam verification token is missing. Please complete the security check.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data: TurnstileVerifyResponse = await res.json();

    if (!data.success) {
      console.warn("Turnstile verification failed:", data["error-codes"]);
      return {
        success: false,
        error:
          "Security verification failed. Please refresh the page and try again.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Error during Turnstile verification:", err);
    // Don't block legitimate users if Cloudflare API is temporarily unreachable
    return { success: true };
  }
}
