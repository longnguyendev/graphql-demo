import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class BaseService<Entity extends BaseEntity> {
  constructor(protected readonly repository: Repository<Entity>) {}

  async findAll(options?: {
    queryBuilder?: (qb: SelectQueryBuilder<Entity>) => void;
  }): Promise<Entity[]> {
    const queryBuilder = this.repository.createQueryBuilder();

    if (options?.queryBuilder) {
      options.queryBuilder(queryBuilder);
    }

    return queryBuilder.getMany();
  }

  async findOne(
    id: number,
    options?: { queryBuilder?: (qb: SelectQueryBuilder<Entity>) => void },
  ): Promise<Entity> {
    const queryBuilder = this.repository.createQueryBuilder();

    if (options?.queryBuilder) {
      options.queryBuilder(queryBuilder);
    }

    return queryBuilder.where({ id }).getOne();
  }

  async findOneOrFail(
    id: number,
    options?: { queryBuilder?: (qb: SelectQueryBuilder<Entity>) => void },
  ): Promise<Entity> {
    try {
      const queryBuilder = this.repository.createQueryBuilder();

      if (options?.queryBuilder) {
        options.queryBuilder(queryBuilder);
      }

      return await queryBuilder.where({ id }).getOneOrFail();
    } catch (error) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
  }

  async create(entity: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.save(entity);
  }

  async update(
    id: number,
    partialEntity: QueryDeepPartialEntity<Entity>,
  ): Promise<Entity> {
    await this.repository.update(id, partialEntity);

    return this.findOneOrFail(id);
  }

  async remove(id: number): Promise<Entity> {
    const entity = await this.findOneOrFail(id);

    return this.repository.remove(entity);
  }
}
