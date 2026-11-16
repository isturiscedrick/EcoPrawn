/**
 * Pure authentication-form helpers shared by the sign-in and sign-up UI.
 * Keep validation messages and password guidance in one place so the form
 * component can focus on state and rendering.
 */
export const authErrors: Record<string, string> = {
  configuration: "Google sign-in is not configured yet. Contact your administrator.",
  expired: "Your sign-in request expired. Please try again.",
  cancelled: "Google sign-in was cancelled. You can try again.",
  unauthorized: "Please use a verified Google account to sign in.",
  failed: "We could not complete sign-in. Please try again.",
};

export const SIGNUP_STEPS = ["Your details", "Account"] as const;

export function passwordStrength(pw: string): { filled: number; label: string; color: string } {
  if (!pw) return { filled: 0, label: "", color: "" };
  if (pw.length < 8) return { filled: 1, label: "Too short", color: "var(--ep-danger)" };
  const score =
    1 +
    (pw.length >= 12 ? 1 : 0) +
    (/[a-z]/.test(pw) && /[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (score <= 2) return { filled: 2, label: "Okay", color: "var(--amber)" };
  if (score === 3) return { filled: 3, label: "Good", color: "var(--ep-ok)" };
  return { filled: 4, label: "Strong", color: "var(--ep-ok)" };
}

/** Translate native browser validity into concise, field-specific guidance. */
export function messageFor(input: HTMLInputElement): string {
  const validity = input.validity;
  if (validity.valid) return "";
  switch (input.name) {
    case "name":
      return "Enter your full name.";
    case "username":
      return validity.valueMissing
        ? "Choose a username."
        : "Use 3–30 letters, numbers, or underscores, starting with a letter.";
    case "identifier":
      return "Enter your username or mobile number.";
    case "phone":
      return "Enter your mobile number.";
    case "password":
      if (validity.valueMissing) {
        return input.autocomplete === "new-password" ? "Enter a password." : "Enter your password.";
      }
      return "Use at least 8 characters.";
    case "code":
      return validity.valueMissing ? "Enter the code from your text message." : "The code is 6–10 digits.";
    default:
      return input.validationMessage;
  }
}
