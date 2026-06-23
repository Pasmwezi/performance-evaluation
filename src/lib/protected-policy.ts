export const PROTECTED_B_AUTHORIZED_EMAILS_ENV = "PROTECTED_B_AUTHORIZED_EMAILS";
export const PROTECTED_B_ADMIN_EMAILS_ENV = "PROTECTED_B_ADMIN_EMAILS";

function parseEmailList(value?: string) {
  return (value || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getBootstrapProtectedBEmails() {
  return parseEmailList(process.env[PROTECTED_B_AUTHORIZED_EMAILS_ENV]);
}

export function getBootstrapAdminEmails() {
  return parseEmailList(process.env[PROTECTED_B_ADMIN_EMAILS_ENV]);
}

export function isBootstrapProtectedBUser(email?: string | null) {
  if (!email) {
    return false;
  }

  return getBootstrapProtectedBEmails().includes(email.toLowerCase());
}

export function isBootstrapAdmin(email?: string | null) {
  if (!email) {
    return false;
  }

  return getBootstrapAdminEmails().includes(email.toLowerCase());
}

export function hasProtectedBAccess(email?: string | null, dbAccess = false, role?: string | null) {
  return dbAccess || role === "ADMIN" || isBootstrapAdmin(email) || isBootstrapProtectedBUser(email);
}

export function hasAdminAccess(email?: string | null, role?: string | null) {
  return role === "ADMIN" || isBootstrapAdmin(email);
}

export function hasEvaluatorAccess(role?: string | null) {
  return role === "ADMIN" || role === "CONTRACTING_OFFICER" || role === "EVALUATOR";
}
