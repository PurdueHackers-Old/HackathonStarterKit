import 'jest';
import * as supertest from 'supertest';
import Server from '../../server';
import { Status } from '../../../shared/app.enums';
import { Role } from '../../../shared/user.enums';
import { GlobalsController } from '../../controllers/globals.controller';
import { UserController } from '../../controllers/user.controller';
import { Application } from '../../models/application';
import { IUserModel, User } from '../../models/user';
import { generateApplication, generateUser, generateUsers } from '../helper';

let server: Server;
let request: supertest.SuperTest<supertest.Test>;
let users: { user: IUserModel; token: string }[];
let user: { user: IUserModel; token: string };

describe('Suite: /api/admin -- Integration', () => {
	beforeEach(async () => {
		jest.mock('../../services/email.service.ts');
		server = await Server.createInstance();
		request = supertest(server.app);
		await server.mongoose.connection.dropDatabase();

		users = await Promise.all<{ user: IUserModel; token: string }>(
			generateUsers(6).map(u =>
				request
					.post('/api/auth/signup')
					.send(u)
					.then(response => response.body.response)
			)
		);

		user = users[0];
	});

	afterEach(() => {
		jest.unmock('../../services/email.service.ts');
		return server.mongoose.disconnect();
	});

	describe('Get Users', () => {
		it('Fails to get users because only USER role', async () => {
			const {
				body: { error },
				status
			} = await request.get(`/api/admin/users`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(401);
			expect(error).toEqual('Insufficient permissions');
		});

		it('Successfully gets all users', async () => {
			await server.mongoose.connection.dropDatabase();

			user = await request
				.post('/api/auth/signup')
				.send(generateUser())
				.then(res => res.body.response);

			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const {
				body: { response },
				status
			} = await request.get(`/api/admin/users`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(200);
			expect(response).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: user.user.name,
						email: user.user.email
					})
				])
			);
		});

		it('Successfully gets all users', async () => {
			await server.mongoose.connection.dropDatabase();

			user = await request
				.post('/api/auth/signup')
				.send(generateUser())
				.then(res => res.body.response);

			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const {
				body: { response },
				status
			} = await request.get(`/api/admin/users`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(200);
			expect(response).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: user.user.name,
						email: user.user.email
					})
				])
			);
		});
	});

	describe('Update roles', () => {
		it('Fails to update role because unauthorized', async () => {
			const {
				body: { error },
				status
			} = await request.post(`/api/admin/role`);

			expect(status).toEqual(401);
			expect(error).toEqual('You must be logged in!');
		});

		it('Fails to update role because only USER role', async () => {
			const {
				body: { error },
				status
			} = await request.post(`/api/admin/role`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(401);
			expect(error).toEqual('Insufficient permissions');
		});

		it('Fails to update role because only EXEC role', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.EXEC } },
				{ new: true }
			);

			const {
				body: { error },
				status
			} = await request.post(`/api/admin/role`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(401);
			expect(error).toEqual('Insufficient permissions');
		});

		it('Fails to update role because no role', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const oldUser = users[1].user;

			const {
				body: { error },
				status
			} = await request
				.post(`/api/admin/role`)
				.send({ email: oldUser.email })
				.auth(user.token, { type: 'bearer' });

			expect(status).toEqual(400);
			expect(error).toEqual('Invalid Role');
		});

		it('Fails to update role because invalid role', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const oldUser = users[1].user;
			const role = 'invalid';

			const {
				body: { error },
				status
			} = await request
				.post(`/api/admin/role`)
				.send({ email: oldUser.email, role })
				.auth(user.token, { type: 'bearer' });

			expect(status).toEqual(400);
			expect(error).toEqual('Invalid Role');
		});

		it('Fails to update role non existant user', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const email = 'blah';
			const {
				body: { error },
				status
			} = await request
				.post(`/api/admin/role`)
				.send({ email, role: Role.MENTOR })
				.auth(user.token, { type: 'bearer' });

			expect(status).toEqual(400);
			expect(error).toEqual(`There is no user with email: ${email}`);
		});

		it('Successfully updates a users role', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const oldUser = users[1].user;

			const {
				body: { response },
				status
			} = await request
				.post(`/api/admin/role`)
				.send({ email: oldUser.email, role: Role.MENTOR })
				.auth(user.token, { type: 'bearer' });

			expect(status).toEqual(200);
			expect(response).toBeTruthy();
			expect(response).toEqual(
				expect.objectContaining({
					...oldUser,
					updatedAt: response.updatedAt,
					role: Role.MENTOR
				})
			);
		});
	});

	describe('Sends mass emails', () => {
		it('Fails to update role because unauthorized', async () => {
			const {
				body: { error },
				status
			} = await request.post(`/api/admin/emails`);

			expect(status).toEqual(401);
			expect(error).toEqual('You must be logged in!');
		});

		it('Fails to update role because only USER role', async () => {
			const {
				body: { error },
				status
			} = await request.post(`/api/admin/emails`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(401);
			expect(error).toEqual('Insufficient permissions');
		});

		it('Fails to update role because only EXEC role', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.EXEC } },
				{ new: true }
			);

			const {
				body: { error },
				status
			} = await request.post(`/api/admin/emails`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(401);
			expect(error).toEqual('Insufficient permissions');
		});

		it('Successfully sends mass emails', async () => {
			user.user = await User.findByIdAndUpdate(
				user.user._id,
				{ $set: { role: Role.ADMIN } },
				{ new: true }
			);

			const userController = new UserController();
			userController.globalController = new GlobalsController();

			await Promise.all(
				users.map((u, i) => {
					if (i <= users.length - 5)
						return userController
							.apply({} as any, u.user._id, generateApplication(), u.user)
							.then(app =>
								Application.findByIdAndUpdate(app._id, {
									statusPublic: Status.ACCEPTED
								}).exec()
							);
					else if (i <= users.length - 3)
						return userController
							.apply({} as any, u.user._id, generateApplication(), u.user)
							.then(app =>
								Application.findByIdAndUpdate(app._id, {
									statusPublic: Status.REJECTED
								}).exec()
							);
					else if (i <= users.length - 1)
						return userController
							.apply({} as any, u.user._id, generateApplication(), u.user)
							.then(app =>
								Application.findByIdAndUpdate(app._id, {
									statusPublic: Status.WAITLIST
								}).exec()
							);
				})
			);

			const {
				body: { response },
				status
			} = await request.post(`/api/admin/emails`).auth(user.token, { type: 'bearer' });

			expect(status).toEqual(200);
			expect(response).toBeTruthy();
			expect(Object.keys(response)).toEqual(
				expect.arrayContaining(['accepted', 'rejected', 'waitlisted'])
			);
			expect(response.accepted).toHaveLength(users.length - 4);
			expect(response.rejected).toHaveLength(users.length - 4);
			expect(response.waitlisted).toHaveLength(users.length - 4);
		});
	});
});
