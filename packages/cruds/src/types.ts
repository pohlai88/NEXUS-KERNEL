export interface RequestContext {
  actor: {
    userId: string;
    tenantId?: string;
    roles?: string[];
  };
  requestId?: string;
}

export interface SoftDeleteRecord {
  id: string;
  deletedAt: Date | null;
  deletedBy?: string | null;
}

export interface Repository<T extends SoftDeleteRecord> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  create(data: Omit<T, "id" | "deletedAt" | "deletedBy">): Promise<T>;
  update(id: string, data: Partial<Omit<T, "id" | "deletedAt" | "deletedBy">>): Promise<T>;
  softDelete(id: string, deletedBy: string): Promise<T>;
  restore(id: string): Promise<T>;
  hardDelete(id: string): Promise<void>;
}

export type PolicyCheck = (ctx: RequestContext, action: string) => Promise<void> | void;
export type AuditHook = (
  ctx: RequestContext,
  action: string,
  recordId: string,
  data?: Record<string, unknown>
) => Promise<void> | void;

