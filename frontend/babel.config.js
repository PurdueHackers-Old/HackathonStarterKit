module.exports = api => {
	api.cache(true);

	const presets = ['next/babel', '@zeit/next-typescript/babel'];
	const plugins = [['@babel/plugin-proposal-decorators', { legacy: true }]];

	return {
		plugins,
		presets
	};
};
