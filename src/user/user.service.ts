import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { PaginationArgs } from 'src/common/args/pagination.args';
import { PaginatedUser } from './entities/paginated-user';
import { cursorPagination } from 'src/common/utils/cursorPagination';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({
      email,
    });
  }

  async getUsers(
    paginationArgs: PaginationArgs,
    userId: number,
    name: string,
  ): Promise<PaginatedUser> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where({ id: Not(userId) })
      .andWhere({ name: ILike(`%${name}%`) });

    return cursorPagination({ queryBuilder, paginationArgs });
  }

  async paginateUser(
    paginationArgs: PaginationArgs,
    userId: number,
    search: string,
  ): Promise<PaginatedUser> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where((qb) => {
        const conversationIds = qb
          .subQuery()
          .select('conversation_participants_user."conversationId"')
          .from(
            'conversation_participants_user',
            'conversation_participants_user',
          )
          .where('conversation_participants_user."userId" = :userId', {
            userId,
          })
          .getQuery();

        const userIds = qb
          .subQuery()
          .select('conversation_participants_user."userId"')
          .from(
            'conversation_participants_user',
            'conversation_participants_user',
          )
          .where(
            `conversation_participants_user."conversationId" IN ${conversationIds}`,
          )
          .getQuery();

        return `user.id NOT IN ${userIds}`;
      })
      .andWhere({ id: Not(userId) })
      .andWhere({ name: ILike(`%${search}%`) });

    return cursorPagination({ queryBuilder, paginationArgs });
  }
}
