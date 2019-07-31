module.exports = {
	globalSetup: '<rootDir>/backend/__tests__/globals/setup.js',
	globalTeardown: '<rootDir>/backend/__tests__/globals/teardown.js',
	projects: [
		{
			collectCoverage: true,
			displayName: 'frontend',
			globals: {
				'ts-jest': {
					tsConfig: './frontend/__tests__/tsconfig.test.json'
				}
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
			name: 'frontend',
			preset: 'ts-jest',
			setupFiles: ['./frontend/jest.setup.js'],
			testEnvironment: 'jsdom',
			testMatch: ['**/frontend/__tests__/**/*.test.tsx'],
			testPathIgnorePatterns: ['.next']
		},
		{
			collectCoverage: true,
			displayName: 'backend',
			globals: {
				'ts-jest': {
					tsConfig: './tsconfig.server.json'
				}
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
			name: 'backend',
			preset: 'ts-jest',
			testEnvironment: '<rootDir>/backend/__tests__/globals/env.js',
			testMatch: ['**/backend/__tests__/**/*.test.ts'],
			testPathIgnorePatterns: ['dist']
		},
		{
			collectCoverage: true,
			displayName: 'e2e',
			globals: {
				'ts-jest': {
					tsConfig: './tsconfig.server.json'
					// tsConfig: './tsconfig.json'
				}
			},
			transform: {
				'^.+\\.tsx?$': 'ts-jest'
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
			name: 'e2e',
			preset: 'jest-puppeteer',
			testEnvironment: '<rootDir>/backend/__tests__/globals/env.js',
			testMatch: ['**/e2e/**/*.test.ts'],
			testPathIgnorePatterns: ['dist']
		}
	],
	testPathIgnorePatterns: ['<rootDir>/node_modules/', 'dist/'],
	verbose: true
};
