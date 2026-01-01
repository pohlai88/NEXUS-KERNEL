export type CanonErrorCode =
  | "CANON_VIOLATION"
  | "CONTRACT_MISMATCH"
  | "POLICY_DENIED"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_FAILED"
  | "INTERNAL";

export class CanonError extends Error {
  public readonly code: CanonErrorCode;
  public readonly details?: unknown;

  constructor(code: CanonErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "CanonError";
  }

  toJSON() {
    return { code: this.code, message: this.message, details: this.details };
  }
}

