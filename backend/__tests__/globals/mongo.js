const MongodbMemoryServer = require('mongodb-memory-server').default;

exports.setup = async () => {
	global.mongod = new MongodbMemoryServer();
	const DB = await mongod.getConnectionString(true);
	process.env.DB = DB;
};

exports.teardown = async () => {
	await global.mongod.stop();
};
