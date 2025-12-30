export type ActionId = string;

export type ActionDef = {
  id: ActionId;
  route: string; // API route
  requiresAuth: boolean;
  audit?: boolean;
  permission?: string; // Permission required (e.g., "vendor:approve")
};

export function defineActions<const T extends Record<string, ActionDef>>(defs: T): T {
  return defs;
}

export type ActionRegistry<T extends Record<string, ActionDef>> = T;

