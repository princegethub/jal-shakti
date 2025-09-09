export const StoreType = {
  REDIS: 'redis',
  CACHE: 'cache',
} as const;

export type StoreTypeEnum = (typeof StoreType)[keyof typeof StoreType];

export const SupportedType = {
  STRING: 'string',
  JSON: 'json',
  NUMBER: 'number',
  RAW: 'raw',
} as const;

export type SupportedTypeEnum =
  (typeof SupportedType)[keyof typeof SupportedType];
