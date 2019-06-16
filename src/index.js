'use strict';
require('dotenv').config();
const Telegraf = require('telegraf');
const Database = require('./database');
const Cordillera = require('cordillera');

class World
{
	constructor()
	{
		const size = parseInt(process.env.WORLDGEN_SIZE);
		const heightmap = new Cordillera(.7, size, size);
		this.tiles = heightmap.getLevels(3);
		this.entities = {};
		this.players = {};
		this.age = parseInt(process.env.WORLDGEN_STARTING_AGE);
		this.seed = process.env.WORLDGEN_SEED;
		console.log(size, this.age, this.seed)
	}

	tick() {
		++this.age;
		console.log(`World updated. Age: ${this.age}`)
	}
}

let db;
let world = new World();

(async () => {
	console.log(process.env.NODE_ENV);

	await initDatabase();
	const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

	bot.start(async ctx => {
		const {username} = ctx.from;
		let player = await getPlayer(username);

		if (player) {
			ctx.replyWithMarkdown(`You are already logged in.`);
		} else {
			ctx.replyWithMarkdown(`Welcome to **memoria**.
you'll be known as ${username}`);
			await db.create('players', {username});
			player = await db.read('players', {username});
			world.players[username] = player;
		}
	});

	bot.command('drop', async ctx => {
		if (process.env.NODE_ENV !== 'development') {
			return;
		}
		await db.drop();
		ctx.replyWithMarkdown(`Database dropped.`);
	});

	bot.command('map', ctx => {
		const tiles = world.tiles;
		ctx.replyWithMarkdown(`${JSON.stringify(tiles)}`);
		console.log(world);
	});

	bot.on('message', async ctx => {
		const {username} = ctx.from;
		const player = await getPlayer(username);
		if (player) {
			ctx.replyWithMarkdown(`Hi ${username}.`);
		} else {
			ctx.replyWithMarkdown(`Not logged in. Use the /start command to log in.`);
		}
	});

	setInterval(world.tick.bind(world), parseInt(process.env.WORLD_TICK_PERIOD));
	bot.launch();
})();

async function initDatabase() {
	db = new Database();
	await db.connect(process.env.MONGODB_URI, 'memoria');
}

async function getPlayer(username) {
	let player = world.players[username];
	if (!player) {
		player = await db.read('players', {username});
	}
	return player;
}

