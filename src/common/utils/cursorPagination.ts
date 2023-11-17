import { LessThanOrEqual, MoreThanOrEqual, SelectQueryBuilder } from 'typeorm';
import { PaginationArgs } from '../args/pagination.args';
import { IPaginatedType } from '../entities/paginated';
import { BaseEntity } from '../entities/base.entity';

type CursorPaginationParams<T extends BaseEntity> = {
  queryBuilder: SelectQueryBuilder<T>;
  paginationArgs: PaginationArgs;
  cursorColumn?: keyof T;
  defaultLimit?: number;
  order?: 'ASC' | 'DESC';
};

export async function cursorPagination<T extends BaseEntity>({
  queryBuilder,
  paginationArgs,
  cursorColumn = 'id',
  defaultLimit = 25,
  order = 'DESC',
}: CursorPaginationParams<T>): Promise<IPaginatedType<T>> {
  const { after, first } = paginationArgs;

  const totalQueryBuilder = queryBuilder.clone();

  const totalCount = await totalQueryBuilder.getCount();

  if (after) {
    const offsetId = Number(atob(after));

    queryBuilder.andWhere({
      [cursorColumn]:
        order === 'DESC'
          ? LessThanOrEqual(offsetId)
          : MoreThanOrEqual(offsetId),
    });
  }

  const sort = `${queryBuilder.alias}.${String(cursorColumn)}`;

  const limit = first ?? defaultLimit;

  const data = await queryBuilder
    .orderBy(`${queryBuilder.alias}.updatedAt`, 'DESC')
    .addOrderBy(sort, order)
    .limit(limit + 1)
    .getMany();

  const nodes = data.slice(0, limit);

  const edges = nodes.map((value) => ({
    node: value,
    cursor: btoa(String(value[cursorColumn])),
  }));

  const nextCursor =
    data.length > limit ? btoa(String(data[limit][cursorColumn])) : undefined;

  return {
    nodes,
    edges,
    totalCount,
    nextCursor,
  };
}
