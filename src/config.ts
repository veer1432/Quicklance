const env = import.meta.env;

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === "") return fallback;
  return value.toLowerCase() === "true";
};

export const FEEDBACK_MODE = parseBoolean(env.VITE_FEEDBACK_MODE, false);
export const PAYMENT_MODE = env.VITE_PAYMENT_MODE || "test_credits";
export const IS_TEST_CREDITS_MODE = PAYMENT_MODE === "test_credits";
export const ADMIN_EMAIL = (env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();
export const JITSI_DOMAIN = env.VITE_JITSI_DOMAIN || "meet.jit.si";

export const SESSION_BASE_PRICE = 250;
