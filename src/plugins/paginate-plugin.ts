import { Schema, Model, FilterQuery } from 'mongoose';

interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
}

interface QueryResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

function paginate<T>(schema: Schema<T>): void {
  schema.statics.paginate = async function (
    filter: FilterQuery<T>,
    options: PaginateOptions = {},
  ): Promise<QueryResult<T>> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const page = options.page && options.page > 0 ? options.page : 1;
    const skip = (page - 1) * limit;

    const countPromise = (this as Model<T>).countDocuments(filter).exec();
    let docsPromise = (this as Model<T>)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit) as import('mongoose').Query<
      import('mongoose').Document<T>[],
      import('mongoose').Document<T>,
      Record<string, unknown>,
      T
    >;

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsPromise = docsPromise.populate(populateOption);
      });
    }

    const [totalResults, results] = await Promise.all([
      countPromise,
      docsPromise.exec(),
    ]);
    const totalPages = Math.ceil(totalResults / limit);
    return {
      results: results.map((doc) => doc.toObject() as T),
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
}

export default paginate;
