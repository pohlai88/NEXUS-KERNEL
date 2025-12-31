/**
 * Development Auth Context
 *
 * Provides mock authentication for development/testing.
 * In production, this would be replaced with real auth from Supabase.
 *
 * Test Users (from auth.users):
 * - alice@alpha.com: ca0234c6-3aca-4269-b9e7-e943a2e27e90 (admin)
 * - alex@alpha.com: abfe4c5d-e4c1-456d-8dfd-c89152ff7b60 (viewer)
 * - bob@beta.com: 287ed0e9-1a11-4c1c-9d70-5882f21e65f2
 * - bella@beta.com: f1981463-4647-426f-b832-6bc38847562c
 */

export interface DevUser {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  tenantId: string;
  vendorGroupId?: string;
  vendorId?: string;
}

export interface RequestContext {
  actor: {
    userId: string;
    tenantId?: string;
    vendorGroupId?: string;
    vendorId?: string;
    groupId?: string;
    roles: string[];
  };
  requestId: string;
}

// Default dev user: Alice (admin with full access)
export const DEV_USERS: Record<string, DevUser> = {
  alice: {
    userId: "ca0234c6-3aca-4269-b9e7-e943a2e27e90",
    email: "alice@alpha.com",
    name: "Alice Alpha",
    roles: ["admin", "group_manager"],
    tenantId: "11111111-1111-1111-1111-111111111111",
    vendorGroupId: "22222222-2222-2222-2222-222222222222",
    vendorId: "20000000-0000-0000-0000-000000000001",
  },
  alex: {
    userId: "abfe4c5d-e4c1-456d-8dfd-c89152ff7b60",
    email: "alex@alpha.com",
    name: "Alex Alpha",
    roles: ["viewer"],
    tenantId: "11111111-1111-1111-1111-111111111111",
  },
  bob: {
    userId: "287ed0e9-1a11-4c1c-9d70-5882f21e65f2",
    email: "bob@beta.com",
    name: "Bob Beta",
    roles: ["viewer"],
    tenantId: "11111111-1111-1111-1111-111111111111",
  },
};

// Active dev user (change this to test different users)
const ACTIVE_DEV_USER = "alice";

/**
 * Get the current dev user
 */
export function getDevUser(): DevUser {
  return DEV_USERS[ACTIVE_DEV_USER] || DEV_USERS.alice;
}

/**
 * Get request context for server components
 * This replaces the placeholder getRequestContext() in pages
 */
export function getRequestContext(): RequestContext {
  const user = getDevUser();
  return {
    actor: {
      userId: user.userId,
      tenantId: user.tenantId,
      vendorGroupId: user.vendorGroupId,
      vendorId: user.vendorId,
      groupId: "33333333-3333-3333-3333-333333333333", // Alpha Corp Holdings
      roles: user.roles,
    },
    requestId: crypto.randomUUID(),
  };
}

/**
 * Get user ID for database queries
 */
export function getDevUserId(): string {
  return getDevUser().userId;
}

/**
 * Get tenant ID for database queries
 */
export function getDevTenantId(): string {
  return getDevUser().tenantId;
}

/**
 * Get vendor group ID for vendor-specific queries
 */
export function getDevVendorGroupId(): string | undefined {
  return getDevUser().vendorGroupId;
}
