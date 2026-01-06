import { z } from "zod";

export const CanonId = z
  .string()
  .min(3)
  .max(160)
  .regex(/^[A-Z0-9:_-]+$/, "CanonId must be uppercase, stable, and machine-safe");

export type CanonId = z.infer<typeof CanonId>;

