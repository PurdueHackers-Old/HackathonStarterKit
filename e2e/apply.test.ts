import ServerType from '../backend/server';
import CONFIG from '../dist/backend/config';
import Server from '../dist/backend/server';
import * as puppeteer from 'puppeteer';
import { generateUser, generateApplication } from '../backend/__tests__/helper';
import { Application } from '../dist/backend/models/application';

jest.setTimeout(100000);

let server: ServerType;
let browser: puppeteer.Browser;
describe('Suite: Create application -- E2E', () => {
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

	it('Successfully creates an application', async () => {
		const fakeUser = generateUser();
		const page = await browser.newPage();
		await page.goto(`http://localhost:${CONFIG.PORT}/signup`);
		await page.type('input[name=name]', fakeUser.name);
		await page.type('input[name=email]', fakeUser.email);
		await page.type('input[name=password]', fakeUser.password);
		await page.type('input[name=passwordConfirm]', fakeUser.passwordConfirm);
		await page.click('input[value="Submit"]');
		await page.waitForNavigation();
		await expect(page).toMatch(`Welcome ${fakeUser.name}`);

		const [applyButton] = await page.$x(`//button[text()="Apply"]`);
		await applyButton.click();
		await page.waitForNavigation();
		await page.waitForXPath(`//h3[text()="Apply Page"]`);

		const application = generateApplication();
		await page.select('select[name=gender]', application.gender);
		await page.select('select[name=ethnicity]', application.ethnicity);
		await page.select('select[name=classYear]', application.classYear);
		await page.select('select[name=graduationYear]', `${application.graduationYear}`);
		await page.select('select[name=major]', application.major);
		await page.select('select[name=referral]', application.referral);
		await page.type('input[name=hackathons]', `${application.hackathons}`);
		await page.select('select[name=shirtSize]', application.shirtSize);
		await page.type('input[name=dietaryRestrictions]', application.dietaryRestrictions);
		await page.type('input[name=website]', application.website);
		await page.type('textarea[name=answer1]', application.answer1);
		await page.type('textarea[name=answer2]', application.answer2);
		await page.click('input[value="Submit"]');
		await page.waitFor(500);
		await expect(page).toMatch('Application successful!');

		const dbApp = await Application.findOne({
			answer1: application.answer1,
			answer2: application.answer2,
			dietaryRestrictions: application.dietaryRestrictions,
			website: application.website
		}).exec();
		application.resume = '';
		expect(dbApp).toMatchObject(application);
	});
});
