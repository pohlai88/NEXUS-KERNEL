import { CanonError } from "@nexus/kernel";
import type {
  RequestContext,
  Repository,
  SoftDeleteRecord,
  PolicyCheck,
  AuditHook,
} from "./types";

export interface CrudSOptions<T extends SoftDeleteRecord> {
  entity: string;
  repo: Repository<T>;
  policyCheck?: PolicyCheck;
  audit?: AuditHook;
}

export function crudS<T extends SoftDeleteRecord>(options: CrudSOptions<T>) {
  const { entity, repo, policyCheck, audit } = options;

  const ensureExists = async (id: string): Promise<T> => {
    const rec = await repo.findById(id);
    if (!rec) {
      throw new CanonError("NOT_FOUND", `${entity} not found`, { id });
    }
    return rec;
  };

  return {
    get: async (ctx: RequestContext, id: string): Promise<T> => {
      await policyCheck?.(ctx, `${entity}:get`);
      const rec = await ensureExists(id);
      if (rec.deletedAt) {
        throw new CanonError("NOT_FOUND", `${entity} is deleted`, { id });
      }
      return rec;
    },

    list: async (ctx: RequestContext, filters?: Record<string, unknown>): Promise<T[]> => {
      await policyCheck?.(ctx, `${entity}:list`);
      const all = await repo.findAll(filters);
      return all.filter((rec) => !rec.deletedAt);
    },

    create: async (
      ctx: RequestContext,
      data: Omit<T, "id" | "deletedAt" | "deletedBy">
    ): Promise<T> => {
      await policyCheck?.(ctx, `${entity}:create`);
      const out = await repo.create(data);
      await audit?.(ctx, `${entity}.created`, out.id, data);
      return out;
    },

    update: async (
      ctx: RequestContext,
      id: string,
      data: Partial<Omit<T, "id" | "deletedAt" | "deletedBy">>
    ): Promise<T> => {
      await policyCheck?.(ctx, `${entity}:update`);
      const rec = await ensureExists(id);
      if (rec.deletedAt) {
        throw new CanonError("CONFLICT", `${entity} is deleted`, { id });
      }
      const out = await repo.update(id, data);
      await audit?.(ctx, `${entity}.updated`, out.id, data);
      return out;
    },

    softDelete: async (ctx: RequestContext, id: string, reason: string): Promise<T> => {
      await policyCheck?.(ctx, `${entity}:soft_delete`);
      const rec = await ensureExists(id);
      if (rec.deletedAt) {
        throw new CanonError("CONFLICT", `${entity} is already deleted`, { id });
      }
      const out = await repo.softDelete(id, ctx.actor.userId);
      await audit?.(ctx, `${entity}.soft_deleted`, out.id, { reason });
      return out;
    },

    restore: async (ctx: RequestContext, id: string, reason: string): Promise<T> => {
      await policyCheck?.(ctx, `${entity}:restore`);
      const rec = await ensureExists(id);
      if (!rec.deletedAt) {
        throw new CanonError("CONFLICT", `${entity} is not deleted`, { id });
      }
      const out = await repo.restore(id);
      await audit?.(ctx, `${entity}.restored`, out.id, { reason });
      return out;
    },

    hardDelete: async (ctx: RequestContext, id: string, reason: string): Promise<void> => {
      await policyCheck?.(ctx, `${entity}:hard_delete`);
      await ensureExists(id);
      await repo.hardDelete(id);
      await audit?.(ctx, `${entity}.hard_deleted`, id, { reason });
    },
  };
}

