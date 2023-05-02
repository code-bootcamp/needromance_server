import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
	constructor(
		private readonly dataSource: DataSource, // // private connection: Connection,
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
		if (event.entity.point < 0) {
			event.entity.point = 0;
		}
		// console.log(event.entity);
		// console.log('@@@');
		event.entity.userRanking = Math.trunc(event.entity.point / 50);
	}
}
