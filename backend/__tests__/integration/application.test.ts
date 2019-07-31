import 'jest';
import * as supertest from 'supertest';
import { generateUser, generateApplication, generateUsers } from '../helper';
import Server from '../../server';
import { Role } from '../../../shared/user.enums';
import { IUserModel, User } from '../../models/user';
import { IApplicationModel } from '../../models/application';

let server: Server;
let request: supertest.SuperTest<supertest.Test>;
let users: { user: IUserModel; token: string }[];
let user: { user: IUserModel; token: string };
let applications: IApplicationModel[];

describe('Suite: /api/applications -- Integration', () => {
	beforeEach(async () => {
		await Server.createInstance().then(s => {
			server = s;
			request = supertest(s.app);
		});
		await server.mongoose.connection.dropDatabase();

		users = await Promise.all<{ user: IUserModel; token: string }>(
			generateUsers(6).map(u =>
				request
					.post('/api/auth/signup')
					.send(u)
					.then(response => response.body.response)
			)
		);

		applications = await Promise.all<IApplicationModel>(
			users.map(u =>
				request
					.post(`/api/users/${u.user._id}/apply`)
					.send(generateApplication())
					.auth(u.token, { type: 'bearer' })
					.then(response => response.body.response)
			)
		);

		user = users[0];
	});

	afterEach(() => server.mongoose.disconnect());

	describe('Get all Applications', () => {
		it('Fail to get all applications without logging in', async () => {
			const {
				body: { error },
				status
			} = await request.get('/api/applications');

			expect(status).toEqual(401);
			expect(error).toEqual('You must be logged in!');
		});

		it('Fail to get all applications with unsufficient permissions', async () => {
			const {
				body: { error },
				status
			} = await request.get('/api/applications').auth(user.token, { type: 'bearer' });

			expect(status).toEqual(401);
			expect(error).toEqual('Insufficient permissions');
		});

		it('Successfully gets all applications as exec', async () => {
			const exec = await request
				.post('/api/auth/signup')
				.send(generateUser())
				.then(resp => resp.body.response);

			exec.user = await User.findByIdAndUpdate(
				exec.user._id,
				{ role: Role.EXEC },
				{ new: true }
			).exec();

			const {
				body: { response },
				status
			} = await request.get('/api/applications').auth(exec.token, { type: 'bearer' });

			expect(status).toEqual(200);
			expect(response.applications).toHaveLength(applications.length);
			expect(response.applications).toEqual(
				expect.arrayContaining(
					applications.map(app =>
						expect.objectContaining({
							gender: app.gender,
							ethnicity: app.ethnicity,
							classYear: app.classYear,
							graduationYear: app.graduationYear,
							major: app.major,
							referral: app.referral,
							hackathons: app.hackathons,
							shirtSize: app.shirtSize,
							dietaryRestrictions: app.dietaryRestrictions,
							website: app.website,
							answer1: app.answer1,
							answer2: app.answer2
						})
					)
				)
			);
		});

		it('Successfully gets all applications as admin', async () => {
			const admin = await request
				.post('/api/auth/signup')
				.send(generateUser())
				.then(resp => resp.body.response);

			admin.user = await User.findByIdAndUpdate(
				admin.user._id,
				{ role: Role.ADMIN },
				{ new: true }
			).exec();

			const {
				body: { response },
				status
			} = await request.get('/api/applications').auth(admin.token, { type: 'bearer' });

			expect(status).toEqual(200);
			expect(response.applications).toHaveLength(applications.length);
			expect(response.applications).toEqual(
				expect.arrayContaining(
					applications.map(app =>
						expect.objectContaining({
							gender: app.gender,
							ethnicity: app.ethnicity,
							classYear: app.classYear,
							graduationYear: app.graduationYear,
							major: app.major,
							referral: app.referral,
							hackathons: app.hackathons,
							shirtSize: app.shirtSize,
							dietaryRestrictions: app.dietaryRestrictions,
							website: app.website,
							answer1: app.answer1,
							answer2: app.answer2
						})
					)
				)
			);
		});
	});
});
