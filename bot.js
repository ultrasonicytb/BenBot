const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const { token, infoChannel } = require('./config.json');
const { reloadCommands, addJSONCommand } = require('./deploy-commands');
const { autoupdate } = require('./autoupdate');

const version = fs.readFileSync(path.join(__dirname, 'version'), "utf-8")

const myFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} | ${level}: ${message} | ${label}`;
});

const logger = createLogger({
	level: 'info',
	format: combine(
		label({ label: version }),
		timestamp(),
		myFormat
	),
	transports: [
		new transports.Console(
			{ format: format.combine(format.timestamp(), format.colorize(), format.simple()) }
		),
		new transports.File({ filename: 'error.log', level: 'error' }),
		new transports.File({ filename: 'combined.log' })
	]
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers
	]
});

client.once('ready', async () => {
	client.user.setPresence({ activities: [{ name: 'Yes...' }], status: 'idle' });
	// await autoupdate(client)
	await reloadCommands(client.logger)
	client.logger.info("Bot Started");
});

client.commands = new Collection();
client.logger = logger;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}
client.logger.info(`Loaded ${client.commands.size} commands`);

// Handling events
const eventPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventPath, file);
	const event = require(filePath);
	if (event.once) client.once(event.eventString, (...args) => event.execute(...args))
	else client.on(event.eventString, (...args) => event.execute(...args))
}

client.logger.info(`Loaded ${eventFiles.length} events`);

process.on('exit', (code) => {
	client.logger.info(`Exiting with code ${code}`);
});
process.on('SIGINT', () => {
	client.logger.info("SIGINT received");
	process.exit(0);
});

client.login(token);
