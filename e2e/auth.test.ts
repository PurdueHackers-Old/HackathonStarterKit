import * as puppeteer from 'puppeteer';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { generateUser } from '../backend/__tests__/helper';
import ServerType from '../backend/server';
import CONFIG from '../dist/backend/config';
import Server from '../dist/backend/server';
import { IUserModel } from '../backend/models/user';
import { User } from '../dist/backend/models/user';
import { Role } from '../dist/shared/user.enums';

jest.setTimeout(100000);

let server: ServerType;
let browser: puppeteer.Browser;
describe('Suite: Authentication Flows -- E2E', () => {
	beforeEach(async () => {
		server = await Server.createInstance();
		await server.mongoose.connection.dropDatabase();
		await server.start();
		browser = await puppeteer.launch({
			headless: CONFIG.HEADLESS
		});
	});

	afterEach(async () => {
		await browser.close();
		await server.stop();
	});

	it('Successfully signs up', async () => {
		const fakeUser = generateUser();
		const page = await browser.newPage();
		await page.goto(`http://localhost:${CONFIG.PORT}`);
		const [signup] = await page.$x(`//a[@href="/signup"]`);
		await signup.click();
		await page.waitForNavigation();
		await page.type('input[name=name]', fakeUser.name);
		await page.type('input[name=email]', fakeUser.email);
		await page.type('input[name=password]', fakeUser.password);
		await page.type('input[name=passwordConfirm]', fakeUser.passwordConfirm);
		await page.click('input[value="Submit"]');
		await page.waitForNavigation();
		await expect(page).toMatch(`Welcome ${fakeUser.name}`);
	});

	it('Successfully logs in and logs out', async () => {
		const fakeUser = generateUser();
		const user: { user: IUserModel; token: string } = await axios
			.post(`http://localhost:${CONFIG.PORT}/api/auth/signup`, fakeUser)
			.then(({ data }) => data.response);

		(user as any).user = await User.findByIdAndUpdate(
			user.user._id,
			{ $set: { role: Role.ADMIN } },
			{ new: true }
		).exec();

		const page = await browser.newPage();
		await page.goto(`http://localhost:${CONFIG.PORT}`);
		const [login] = await page.$x(`//a[@href="/login"]`);
		await login.click();
		await page.waitForNavigation();
		await page.type('input[name=email]', user.user.email);
		await page.type('input[name=password]', fakeUser.password);
		await page.click('input[value="Submit"]');
		await page.waitForNavigation();
		await expect(page).toMatch(`Welcome ${user.user.name}`);
		let cookies = await page.cookies();
		let cookie = cookies.find(c => c.name === 'token');
		expect(cookie).toBeTruthy();
		try {
			const { _id } = jwt.verify(cookie.value, CONFIG.SECRET) as any;
			expect(_id).toEqual(user.user.id);
		} catch (error) {
			expect(error).toBeFalsy();
		}

		const [logout] = await page.$x(`//a[@href="/logout"]`);
		await logout.click();
		await page.waitForNavigation();
		await expect(page).toMatch(`Successfully logged out`);
		cookies = await page.cookies();
		cookie = cookies.find(c => c.name === 'token');
		expect(cookie).toBeFalsy();
	});
});
