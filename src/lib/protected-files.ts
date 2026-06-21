import "server-only";

import path from "path";

const UPLOAD_DIR_ENV = "PROTECTED_UPLOAD_DIR";

export function getProtectedUploadDir() {
  return process.env[UPLOAD_DIR_ENV] || path.join(process.cwd(), "protected-uploads");
}

export function buildProtectedFileUrl(filename: string) {
  return `/api/files/${encodeURIComponent(filename)}`;
}

export function getProtectedFilenameFromUrl(url: string) {
  const normalized = url.replace(/\\/g, "/");
  const filename = normalized.split("/").filter(Boolean).at(-1);

  if (!filename) {
    return null;
  }

  return decodeURIComponent(filename);
}

export function toProtectedFileUrl(url: string) {
  const filename = getProtectedFilenameFromUrl(url);

  if (!filename) {
    return url;
  }

  return buildProtectedFileUrl(filename);
}

