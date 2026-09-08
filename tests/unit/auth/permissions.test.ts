import { describe, expect, it } from "vitest";
import {
  canDeleteResource,
  canEditResource,
  canManageSettings,
  canManageUsers,
} from "@/lib/permissions";

describe("Role & Permissions Logic", () => {
  describe("canManageUsers", () => {
    it("allows only super_admin to manage users", () => {
      expect(canManageUsers("super_admin")).toBe(true);
      expect(canManageUsers("admin")).toBe(false);
      expect(canManageUsers("editor")).toBe(false);
      expect(canManageUsers("creator")).toBe(false);
      expect(canManageUsers(null)).toBe(false);
      expect(canManageUsers(undefined)).toBe(false);
    });
  });

  describe("canDeleteResource", () => {
    it("allows super_admin, admin, and editor to delete resources", () => {
      expect(canDeleteResource("super_admin")).toBe(true);
      expect(canDeleteResource("admin")).toBe(true);
      expect(canDeleteResource("editor")).toBe(true);
    });

    it("strictly prevents creator and unauthenticated roles from deleting", () => {
      expect(canDeleteResource("creator")).toBe(false);
      expect(canDeleteResource("unknown_role")).toBe(false);
      expect(canDeleteResource(null)).toBe(false);
      expect(canDeleteResource(undefined)).toBe(false);
    });
  });

  describe("canManageSettings", () => {
    it("allows super_admin and admin to manage settings", () => {
      expect(canManageSettings("super_admin")).toBe(true);
      expect(canManageSettings("admin")).toBe(true);
      expect(canManageSettings("editor")).toBe(false);
      expect(canManageSettings("creator")).toBe(false);
    });
  });

  describe("canEditResource", () => {
    it("allows all valid team roles to create or edit resources", () => {
      expect(canEditResource("super_admin")).toBe(true);
      expect(canEditResource("admin")).toBe(true);
      expect(canEditResource("editor")).toBe(true);
      expect(canEditResource("creator")).toBe(true);
    });

    it("rejects unauthorized callers", () => {
      expect(canEditResource("anonymous")).toBe(false);
      expect(canEditResource(null)).toBe(false);
    });
  });
});
