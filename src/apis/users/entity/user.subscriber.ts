import { NotImplementedException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
	constructor(
		dataSource: DataSource, //
		// private connection: Connection,
	) {
		dataSource.subscribers.push(this);
	}

	/**
	 * Indicates that this subscriber only listen to User events.
	 */

	listenTo() {
		return User;
	}

	/**
	 * Called before entity update.
	 */
	beforeUpdate(event: UpdateEvent<User>) {
		console.log(`BEFORE ENTITY UPDATED: `, event.entity, 'subscriber 작동 테스트');
		if (event.entity.point < 0) {
			event.entity.point = 0;
		}
	}

	async afterUpdate(event: UpdateEvent<User>) {
		console.log(`AFTER ENTITY UPDATED: `, event.entity, 'subscriber 작동 테스트');

		if (event.entity.point >= 50) {
			event.entity.userRanking = 2;
		} else if (event.entity.point >= 100) {
			event.entity.userRanking = 3;
		} else if (event.entity.point >= 150) {
			event.entity.userRanking = 4;
		} else if (event.entity.point >= 200) {
			event.entity.userRanking = 5;
		}
		console.log(event.entity, '###');
		// await event.manager.
	}
}
