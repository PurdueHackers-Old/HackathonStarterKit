/* eslint-disable */
import { Container } from 'typedi';
import Server from '../server';
import { User } from '../models/user';
import { AuthController } from '../controllers/auth.controller';
import { generateUsers, generateApplication } from '../__tests__/helper';
import { Application } from '../models/application';
import { Status } from '../../shared/app.enums';
import { Role } from '../../shared/user.enums';
import { UserController } from '../controllers/user.controller';
import { GlobalsController } from '../controllers/globals.controller';

let server: Server;

const start = async () => {
	try {
		const NUM_USERS = 50;
		server = await Server.createInstance();
		const authController = Container.get(AuthController);
		const userController = Container.get(UserController);

		let user = await authController.signup('test123', 'test123', {
			name: 'Test Testerson',
			email: 'test@gmail.com'
		} as any);
		await User.findByIdAndUpdate(user.user._id, { role: Role.ADMIN });
		let userApp = await userController.apply(
			{} as any,
			user.user._id,
			generateApplication() as any,
			user.user
		);
		await userApp.update({ statusPublic: Status.ACCEPTED, statusInternal: Status.ACCEPTED });

		user = await authController.signup('test123', 'test123', {
			name: 'Exec User',
			email: 'exec@gmail.com'
		} as any);
		await User.findByIdAndUpdate(user.user._id, { role: Role.EXEC });
		userApp = await userController.apply(
			{} as any,
			user.user._id,
			generateApplication() as any,
			user.user
		);
		await userApp.update({ statusPublic: Status.ACCEPTED, statusInternal: Status.ACCEPTED });

		const users = await Promise.all(
			generateUsers(NUM_USERS).map(u =>
				authController.signup(u.password, u.password, u as any)
			)
		);

		const admin = await authController.signup('admin', 'admin', {
			name: 'admin',
			email: 'admin@gmail.com',
			password: 'admin',
			passwordConfirm: 'admin',
			role: Role.ADMIN
		} as any);

		const applications = await Promise.all(
			users.map(u =>
				userController.apply({} as any, u.user._id, generateApplication() as any, u.user)
			)
		);

		await Promise.all(
			applications.map(app => {
				let update;
				const i = Math.floor(Math.random() * 12) + 0;
				if (i < 6) update = { statusInternal: Status.PENDING };
				else if (i < 8) update = { statusInternal: Status.ACCEPTED };
				else if (i < 10) update = { statusInternal: Status.REJECTED };
				else update = { statusInternal: Status.WAITLIST };

				return Application.findByIdAndUpdate(app._id, update).exec();
			})
		);
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await server.mongoose.disconnect();
	}
};

start();
