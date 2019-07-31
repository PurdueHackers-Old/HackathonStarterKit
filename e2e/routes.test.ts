import * as puppeteer from 'puppeteer';
import axios from 'axios';
import { generateUser } from '../backend/__tests__/helper';
import ServerType from '../backend/server';
import CONFIG from '../dist/backend/config';
import Server from '../dist/backend/server';
import { IUserModel } from '../backend/models/user';
import { User } from '../dist/backend/models/user';
import { Role } from '../dist/shared/user.enums';

jest.setTimeout(100000);

const routes = [
	{ route: '/', text: 'Home Page' },
	{ route: '/announcements', text: 'Announcements Page' },
	{ route: '/applications', text: 'Applications Page' },
	{ route: '/apply', text: 'Apply Page' },
	{ route: '/checkin', text: 'Checkin Page' },
	{ route: '/dashboard', text: 'Dashboard' },
	{ route: '/profile', text: 'Profile Page' }
];

let server: ServerType;
let browser: puppeteer.Browser;
let user: { user: IUserModel; token: string };
let fakeUser;
describe('Suite: Page Routes -- E2E', () => {
	beforeEach(async () => {
		server = await Server.createInstance();
		await server.mongoose.connection.dropDatabase();
		await server.start();
		browser = await puppeteer.launch({
			headless: CONFIG.HEADLESS
		});
		fakeUser = generateUser();
		user = await axios
			.post(`http://localhost:${CONFIG.PORT}/api/auth/signup`, fakeUser)
			.then(({ data }) => data.response);

		(user as any).user = await User.findByIdAndUpdate(
			user.user._id,
			{ $set: { role: Role.ADMIN } },
			{ new: true }
		).exec();
	});

	afterEach(async () => {
		await browser.close();
		await server.stop();
	});

	it.each(routes)('Successfully renders page routes', async ({ route, text }) => {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${CONFIG.PORT}/login`);
		await page.type('input[name=email]', user.user.email);
		await page.type('input[name=password]', fakeUser.password);
		await page.click('input[value="Submit"]');
		await page.waitForNavigation();
		await page.goto(`http://localhost:${CONFIG.PORT}${route}`);
		await expect(page).toMatch(text);
	});

	it('Fails to render a non-existant page', async () => {
		const page = await browser.newPage();
		await page.goto(`http://localhost:${CONFIG.PORT}/blah`);
		await expect(page).toMatch('404');
		await expect(page).toMatch('This page could not be found');
	});
});
