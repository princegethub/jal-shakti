import { Schema, Document } from 'mongoose';

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

type TransformFunction = (
  doc: Document,
  ret: Record<string, unknown>,
  options: unknown,
) => unknown;

function deleteAtPath(
  obj: Record<string, unknown>,
  path: string[],
  index: number,
): void {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  if (obj[path[index]] && typeof obj[path[index]] === 'object') {
    deleteAtPath(obj[path[index]] as Record<string, unknown>, path, index + 1);
  }
}

function toJSON(schema: Schema): void {
  const currentOptions = schema.get('toJSON') || {};
  const existingTransform = currentOptions.transform as
    | TransformFunction
    | undefined;

  schema.set('toJSON', {
    ...currentOptions,
    transform(doc: Document, ret: Record<string, unknown>, options: unknown) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      const id =
        typeof ret._id?.toString === 'function' ? ret._id.toString() : ret._id;
      ret.id = id;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      if (existingTransform) {
        return existingTransform(doc, ret, options);
      }

      return ret;
    },
  });
}

export default toJSON;
