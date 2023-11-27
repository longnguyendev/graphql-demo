import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    const hashedPassword = await bcrypt.hash(event.entity.password, 10);

    event.entity.name = `${event.entity.firstName} ${event.entity.lastName}`;

    event.entity.password = hashedPassword;
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    event.entity.name = `${event.entity.firstName} ${event.entity.lastName}`;
  }
}
