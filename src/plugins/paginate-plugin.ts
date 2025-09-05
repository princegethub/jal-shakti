import { Schema, Model, FilterQuery, Document, Query } from 'mongoose';

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

function paginate<T extends Document>(schema: Schema<T>): void {
  schema.statics.paginate = async function (
    filter: FilterQuery<T>,
    options: PaginateOptions = {},
  ): Promise<QueryResult<T>> {
    // Sorting
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

    // Count documents
    const countPromise = (this as Model<T>).countDocuments(filter).exec();

    // Fetch documents
    let docsPromise: Query<T[], T> = (this as Model<T>)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

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
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
}

export default paginate;
