/**
 * The AI assistant is built but switched off until NEXT_PUBLIC_ASSISTANT_ENABLED=true.
 * The NEXT_PUBLIC_ prefix makes it available to the UI too; it is read at build time.
 */
export const ASSISTANT_ENABLED = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true";
