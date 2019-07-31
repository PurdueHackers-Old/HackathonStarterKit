const { setup } = require('./mongo');

module.exports = async () => {
	await setup();
};
