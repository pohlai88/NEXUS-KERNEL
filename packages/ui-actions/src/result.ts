import type { CanonErrorCode } from "@nexus/kernel";

export type ActionError = {
  code: CanonErrorCode;
  message: string;
  details?: unknown;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err(code: CanonErrorCode, message: string, details?: unknown): Result<never> {
  return { ok: false, error: { code, message, details } };
}

