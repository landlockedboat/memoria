'use strict';
require('dotenv').config();
const Telegraf = require('telegraf');
const Database = require('./database');

const players = {};

let db;

(async () => {

	console.log(process.env.NODE_ENV);

	await initDatabase();
	const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

	bot.start(async ctx => {
		const {username} = ctx.from;
		const player = await getPlayer(username);

		if (player) {
			ctx.replyWithMarkdown(`You are already logged in.`);
		} else {
			ctx.replyWithMarkdown(`Welcome to **memoria**.
you'll be known as ${username}`);
			await db.create('players', {username});
		}
	});

	bot.command('drop', async ctx => {
		if (process.env.NODE_ENV !== 'development') {
			return;
		}
		await db.drop();
		ctx.replyWithMarkdown(`Database dropped.`);
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

	bot.launch();
})();

async function initDatabase() {
	db = new Database();
	await db.connect(process.env.MONGODB_URI, 'memoria');
}

async function getPlayer(username) {
	let player = players[username];
	if (!player) {
		player = await db.read('players', {username});
	}
	return player;
}

