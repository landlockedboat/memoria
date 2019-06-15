'use strict';

const {MongoClient} = require('mongodb');

module.exports = class Database {
	async connect(mongoDbUri, dbName) {
		this.client = new MongoClient(mongoDbUri, {useNewUrlParser: true});
		await this.client.connect();
		console.log(`Connected: ${mongoDbUri}`);
		this.db = this.client.db(dbName);
	}

	async create(collectionName, object) {
		try {
			const collection = this.db.collection(collectionName);
			return await collection.insertOne(object);
		} catch (err) {
			console.error(err.stack);
		}
	}

	async read(collectionName, object) {
		try {
			const collection = this.db.collection(collectionName);
			return await collection.findOne(object);
		} catch (err) {
			console.error(err.stack);
		}
	}

	async drop() {
		try {
			return await this.db.dropDatabase();
		} catch (err) {
			console.error(err.stack);
		}
	}

	async close() {
		await this.client.close();
	}
};
