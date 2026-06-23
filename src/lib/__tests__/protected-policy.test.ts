import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isBootstrapProtectedBUser,
  isBootstrapAdmin,
  hasProtectedBAccess,
  hasAdminAccess,
  hasEvaluatorAccess,
} from "../protected-policy";

describe("protected-policy", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isBootstrapProtectedBUser", () => {
    it("should return false if email is not provided", () => {
      expect(isBootstrapProtectedBUser(null)).toBe(false);
      expect(isBootstrapProtectedBUser(undefined)).toBe(false);
    });

    it("should return true if email is in PROTECTED_B_AUTHORIZED_EMAILS", () => {
      process.env.PROTECTED_B_AUTHORIZED_EMAILS = "user1@example.com,user2@example.com";
      expect(isBootstrapProtectedBUser("user1@example.com")).toBe(true);
      expect(isBootstrapProtectedBUser("USER2@EXAMPLE.COM")).toBe(true);
      expect(isBootstrapProtectedBUser("user3@example.com")).toBe(false);
    });
  });

  describe("isBootstrapAdmin", () => {
    it("should return false if email is not provided", () => {
      expect(isBootstrapAdmin(null)).toBe(false);
      expect(isBootstrapAdmin(undefined)).toBe(false);
    });

    it("should return true if email is in PROTECTED_B_ADMIN_EMAILS", () => {
      process.env.PROTECTED_B_ADMIN_EMAILS = "admin1@example.com,admin2@example.com";
      expect(isBootstrapAdmin("admin1@example.com")).toBe(true);
      expect(isBootstrapAdmin("ADMIN2@EXAMPLE.COM")).toBe(true);
      expect(isBootstrapAdmin("admin3@example.com")).toBe(false);
    });
  });

  describe("hasProtectedBAccess", () => {
    it("should return true if dbAccess is true", () => {
      expect(hasProtectedBAccess("test@example.com", true)).toBe(true);
    });

    it("should return true if role is ADMIN", () => {
      expect(hasProtectedBAccess("test@example.com", false, "ADMIN")).toBe(true);
    });

    it("should return true if email is bootstrap admin or bootstrap protected B user", () => {
      process.env.PROTECTED_B_ADMIN_EMAILS = "admin@example.com";
      process.env.PROTECTED_B_AUTHORIZED_EMAILS = "user@example.com";

      expect(hasProtectedBAccess("admin@example.com", false, "USER")).toBe(true);
      expect(hasProtectedBAccess("user@example.com", false, "USER")).toBe(true);
      expect(hasProtectedBAccess("other@example.com", false, "USER")).toBe(false);
    });
  });

  describe("hasAdminAccess", () => {
    it("should return true if role is ADMIN", () => {
      expect(hasAdminAccess("test@example.com", "ADMIN")).toBe(true);
    });

    it("should return true if email is bootstrap admin", () => {
      process.env.PROTECTED_B_ADMIN_EMAILS = "admin@example.com";
      expect(hasAdminAccess("admin@example.com", "USER")).toBe(true);
      expect(hasAdminAccess("other@example.com", "USER")).toBe(false);
    });
  });

  describe("hasEvaluatorAccess", () => {
    it("should return true for ADMIN, CONTRACTING_OFFICER, and EVALUATOR roles", () => {
      expect(hasEvaluatorAccess("ADMIN")).toBe(true);
      expect(hasEvaluatorAccess("CONTRACTING_OFFICER")).toBe(true);
      expect(hasEvaluatorAccess("EVALUATOR")).toBe(true);
    });

    it("should return false for other roles or null", () => {
      expect(hasEvaluatorAccess("USER")).toBe(false);
      expect(hasEvaluatorAccess(null)).toBe(false);
      expect(hasEvaluatorAccess(undefined)).toBe(false);
    });
  });
});
